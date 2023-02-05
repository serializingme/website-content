+++
banner = "/uploads/2016/09/powershell-dump-applocker.png"
categories = [ "Configuration", "Incident Response", "Windows" ]
date = "2016-09-23T20:33:00+00:00"
excerpt = "Updated the PowerShell script that dumps the current AppLocker policy..."
format = "post"
tags = [ "AppLocker", "PowerShell", "PowaScripts" ]
title = "Updated AppLocker Dump Script"

+++

I have created a new version of [this][1] script so that it is better aligned with the conventions I use for other PowerShell scripts.

<!--more-->

I have also created the [PowaScripts][2] project were I will publish PowerShell scripts that I use and that might be of public interest. Follows an example on how to invoke the cmdlet.

```powershell {linenos=inline}
Dump-AppLocker -ResultFile policy.xml
```

As with the previous version, the resulting XML file will contain all the rules and conditions making it easy to audit the AppLocker policy. Follows a example result file.

```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<AppLocker Date="2016-09-23T21:50:33.1246017Z" Host="test01.domain.local">
  <Group Name="Appx" />
  <Group Name="Dll">
    <FilePathRule Id="3737732c-99b7-41d4-9037-9cddfb0de0d0" Name="(Default Rule) All DLLs located in the Program Files folder" Description="Allows members of the Everyone group to load DLLs that are located in the Program Files folder." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%PROGRAMFILES%\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="ac881f52-1a4c-4f81-9fdc-02179022f08b" Name="(My Rule) All files located in the Windows Temporary folder" Description="" UserOrGroupSid="S-1-1-0" Action="Deny">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Temp\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="bac4b0bf-6f1b-40e8-8627-8545fa89c8b6" Name="(Default Rule) Microsoft Windows DLLs" Description="Allows members of the Everyone group to load DLLs located in the Windows folder." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="c1a9b922-713f-4a8f-af01-32ff907cd1fd" Name="(My Rule) All files located in the Windows Tasks folder" Description="" UserOrGroupSid="S-1-1-0" Action="Deny">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Tasks\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="fe64f59f-6fca-45e5-a731-0f6715327c38" Name="(Default Rule) All DLLs" Description="Allows members of the local Administrators group to load all DLLs." UserOrGroupSid="S-1-5-32-544" Action="Allow">
      <Conditions>
        <FilePathCondition Path="*" />
      </Conditions>
    </FilePathRule>
  </Group>
  <Group Name="Exe">
    <FilePathRule Id="744af0ed-87d1-4bf4-98a1-8ad4d2823bd3" Name="(My Rule) All files located in the Windows Temporary folder" Description="" UserOrGroupSid="S-1-1-0" Action="Deny">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Temp\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="921cc481-6e17-4653-8f75-050b80acca20" Name="(Default Rule) All files located in the Program Files folder" Description="Allows members of the Everyone group to run applications that are located in the Program Files folder." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%PROGRAMFILES%\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="a61c8b2c-a319-4cd0-9690-d2177cad7b51" Name="(Default Rule) All files located in the Windows folder" Description="Allows members of the Everyone group to run applications that are located in the Windows folder." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="d9efc88e-0b2a-41f1-b12b-ca24cf942aaf" Name="(My Rule) All files located in the Windows Tasks folder" Description="" UserOrGroupSid="S-1-1-0" Action="Deny">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Tasks\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="fd686d83-a829-4351-8ff4-27c7de5755d2" Name="(Default Rule) All files" Description="Allows members of the local Administrators group to run all applications." UserOrGroupSid="S-1-5-32-544" Action="Allow">
      <Conditions>
        <FilePathCondition Path="*" />
      </Conditions>
    </FilePathRule>
  </Group>
  <Group Name="Msi">
    <FilePathRule Id="5b290184-345a-4453-b184-45305f6d9a54" Name="(Default Rule) All Windows Installer files in %systemdrive%\Windows\Installer" Description="Allows members of the Everyone group to run all Windows Installer files located in %systemdrive%\Windows\Installer." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Installer\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="64ad46ff-0d71-4fa0-a30b-3f3d30c5433d" Name="(Default Rule) All Windows Installer files" Description="Allows members of the local Administrators group to run all Windows Installer files." UserOrGroupSid="S-1-5-32-544" Action="Allow">
      <Conditions>
      <FilePathCondition Path="*.*" />
      </Conditions>
    </FilePathRule>
  </Group>
  <Group Name="Script">
    <FilePathRule Id="06dce67b-934c-454f-a263-2515c8796a5d" Name="(Default Rule) All scripts located in the Program Files folder" Description="Allows members of the Everyone group to run scripts that are located in the Program Files folder." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%PROGRAMFILES%\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="3f4760f4-bd8a-47fa-a86e-e2f0222b5e79" Name="(My Rule) All files located in the Windows Tasks folder" Description="" UserOrGroupSid="S-1-1-0" Action="Deny">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Tasks\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="9428c672-5fc3-47f4-808a-a0011f36dd2c" Name="(Default Rule) All scripts located in the Windows folder" Description="Allows members of the Everyone group to run scripts that are located in the Windows folder." UserOrGroupSid="S-1-1-0" Action="Allow">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="b8467b04-066e-40af-8f48-4545e1037e4a" Name="(My Rule) All files located in the Windows Temporary folder" Description="" UserOrGroupSid="S-1-1-0" Action="Deny">
      <Conditions>
        <FilePathCondition Path="%WINDIR%\Temp\*" />
      </Conditions>
    </FilePathRule>
    <FilePathRule Id="ed97d0cb-15ff-430f-b82c-8d7832957725" Name="(Default Rule) All scripts" Description="Allows members of the local Administrators group to run all scripts." UserOrGroupSid="S-1-5-32-544" Action="Allow">
      <Conditions>
        <FilePathCondition Path="*" />
      </Conditions>
    </FilePathRule>
  </Group>
</AppLocker>
```

Hope it is useful :)

[1]: /2015/11/01/inspecting-applocker-policy/ "Older Version"
[2]: /project/powascripts/ "Project Page"
