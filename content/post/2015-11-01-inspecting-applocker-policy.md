+++
banner = "/uploads/2015/11/powershell-applocker-dump.png"
categories = [ "Configuration", "Incident Response", "Windows" ]
date = "2015-11-01T15:16:50+00:00"
excerpt = "While doing incident response, if AppLocker is being used sometimes is useful to know exactly what policy is applied..."
format = "post"
tags = [ "AppLocker", "PowerShell" ]
title = "Inspecting AppLocker Policy"

+++

While doing incident response, if AppLocker is being used but the computer still got infected by a malicious executable, it is useful to know exactly what AppLocker policy is currently applied.

<!--more-->

Leveraging PowerShell is the right choice to achieve this. The following cmdlet will dump the current AppLocker policy to a XML file. It will do that by reading the registry without the need for special permissions (i.e. administrator).

```powershell {linenos=inline}
AppLocker-Dump -PolicyFile policy.xml
```

The resulting XML file will contain all the rules and conditions making it easy to audit them. Follows the source code.

```powershell {linenos=inline}
<#
.SYNOPSIS
    Dump the AppLocker policy to a XML file.
.DESCRIPTION
    This cmdlet allows a normal user, without any special permissions, to
    dump the AppLocker policy from the registry to a XML file.
.PARAMETER PolicyFile
    Where to write the AppLocker policy
.LINK
    https://www.serializing.me/2015/11/01/inspecting-applocker-policy/
.NOTE
    Function: AppLocker-Dump
    Author: Duarte Silva (@serializingme)
    License: GPLv3
    Required Dependencies: None
    Optional Dependencies: None
    Version: 1.0.0
#>
function AppLocker-Dump {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $True, HelpMessage = 'To what file will the AppLocker policy be written?')]
        [String]$PolicyFile
    )

    function Write-PolicyRule {
        param(
            [System.Xml.XmlWriter]$XmlWriter,
            [String]$Rule
        )

        [System.IO.StringReader]$StringReader = $Null
        [System.Xml.XmlReader]$XmlReader = $Null

        try {
            $Property = Get-ItemProperty -Path ('Registry::{0}' -f $Rule) -Name 'Value' `
                    -ErrorAction SilentlyContinue

            $StringReader = New-Object -TypeName 'System.IO.StringReader' -ArgumentList @(
                    $Property.Value )

            $XmlReader = [System.Xml.XmlReader]::Create($StringReader)
            $XmlWriter.WriteNode($XmlReader, $False)
        }
        finally {
            if ($XmlReader -ne $Null) {
                $XmlReader.Close()
            }

            if ($StringReader -ne $Null) {
                $StringReader.Close()
            }
        }
    }

    function Write-PolicyRules {
        param(
            [System.Xml.XmlWriter]$XmlWriter,
            [String]$Group
        )

        Get-ChildItem -Path ('Registry::{0}' -f $Group) | ForEach-Object {
            Write-PolicyRule -XmlWriter $XmlWriter -Rule $_.Name
        }
    }

    function Write-PolicyGroups {
        param(
            [System.Xml.XmlWriter]$XmlWriter
        )

        # Get AppLocker policy groups and process the rules.
        Get-ChildItem -Path 'Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\SrpV2' | ForEach-Object {
            $XmlWriter.WriteStartElement('Group')
            $XmlWriter.WriteAttributeString('Name', $_.PSChildName)

            Write-PolicyRules -XmlWriter $XmlWriter -Group $_.Name

            $XmlWriter.WriteEndElement()
        }
    }

    [System.IO.FileStream]$PolicyFileStrean = $Null
    [System.Xml.XmlWriter]$PolicyXmlWriter = $Null

    try {
        [System.IO.FileInfo]$PolicyFileInfo = New-Object -TypeName 'System.IO.FileInfo' `
                -ArgumentList @( $PolicyFile )

        if ($PolicyFileInfo.Exists) {
            $PSCmdlet.WriteWarning('The selected file for the policy exists and it will be overwritten')
        }

        # Instantiate the streams.
        $PolicyFileStrean = New-Object -TypeName 'System.IO.FileStream' -ArgumentList @(
                $PolicyFileInfo.FullName, [system.IO.FileMode]::Create, [System.IO.FileAccess]::Write )

        # Instantiate the XML writer.
        $PolicyXmlWriter = [System.Xml.XmlWriter]::Create($PolicyFileStrean)
        $PolicyXmlWriter.WriteStartElement('AppLocker')
        $PolicyXmlWriter.WriteAttributeString('Date', (Get-Date -Format 'O'))
        $PolicyXmlWriter.WriteAttributeString('Host', (Hostname))

        Write-PolicyGroups -XmlWriter $PolicyXmlWriter

        $PolicyXmlWriter.WriteEndElement()
    }
    finally {
        if ($PolicyXmlWriter -ne $Null) {
            $PolicyXmlWriter.Close()
        }

        if ($PolicyFileStrean -ne $Null) {
            $PolicyFileStrean.Dispose()
        }
    }
}
```

Hope it's useful :D
