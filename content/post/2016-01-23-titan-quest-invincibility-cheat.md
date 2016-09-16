+++
banner = "/uploads/2016/01/titan-quest.png"
categories = [ "Reverse Engineering" ]
date = "2016-01-23T22:19:09+00:00"
excerpt = "In the last level of Titan Quest, every player will have to face the titan Typhon, Bane of the Gods. A task that is very far from easy..."
format = "post"
tags = [ "Cheat", "Game", "Titan Quest", "TQ-Invincible" ]
title = "Titan Quest Invincibility Cheat"

+++

In the last level of Titan Quest, every player will have to face the titan Typhon, Bane of the Gods. A task that is very far from easy...

<!--more-->

After fighting against it one time, it was clear that it was going to be an hard bone to shew. At that time I was tired of the game, and since I haven't reverse engineered a game in quite some time, I decided to have a look at what I could do to win this last battle without having to level up my character through farming.

<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>Poking around with IDA revealed that the game is completely written in C++ and imports functions from two libraries, <code>engine.dll</code> and <code>game.dll</code>. The first exposes a game engine, and the second the specific Titan Quest game logic.</p>
    <p>After finding the main game loop, I stumbled upon the <code>?GetMainPlayer@GameEngine@GAME@@QBEPAVPlayer@2@XZ</code> function which is exported by <code>game.dll</code>. Decoding the C++ name mangling reveals the following code.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2016/01/tq-getmainplayer.png" alternative="GetMainPlayer" caption="GetMainPlayer function in IDA." thumbnail="/uploads/2016/01/tq-getmainplayer-300x169.png" >}}
  </div>
</div>

{{< gist serializingme 6986630b7b2f8bbb0fc8 "GameEngine.cpp" >}}

<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>This made things easier since now I had a way of getting the memory address where the <code>Player</code> instance of my character is stored. The next step was to put my character in a combat situation and add a 4 bytes hardware read/write breakpoint in that address.</p>
    <p>After stepping through the code at each memory read in that address, I was able to find the function that handled combat and that dealt damage to the characters involved (<code>?Update@ControllerCombat@GAME@@UAEXH@Z</code>).</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2016/01/tq-player-hw-breakpoint.png" alternative="Hardware Breakpoint" caption="Hardware breakpoint in the Player class instance." thumbnail="/uploads/2016/01/tq-player-hw-breakpoint-300x169.png" >}}
  </div>
</div>

Following the flow of execution (i.e., single stepping through the code), I found another interesting function called `?IsInvincible@Character@GAME@@QBE_NX`. Decoding the C++ name mangling reveals the following code.

{{< gist serializingme 6986630b7b2f8bbb0fc8 "Character.cpp" >}}

<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>At this point, I now had the offset at which the invincibility flag is stored in instances of the <code>Player</code> class. Using API Monitor memory editor, I changed the value from zero, to one. From this point onwards, my character became invulnerable to attack.</p>
    <p>Searching in the exports of <code>game.dll</code> for the word "invincible", revealed the function that sets the invincibility flag (I have been reversing malware for so long that I forgot that in non-malicious software you can actually trust the exports ;)</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2016/01/tq-memory-editor.png" alternative="Titan Quest Editing Memory" caption="Editing Titan quest main player invincible flag." thumbnail="/uploads/2016/01/tq-memory-editor-300x169.png" >}}
  </div>
</div>

To make things easier, I have created a [library][1], that when injected into Titan Quest process, will set the invincibility flag. There is a caveat though, the user must be in-game world, otherwise it won&#8217;t work as there is no player character to set the invincible flag to true. Follows a demonstration of the results.

<div class="thumbnail">
{{< youtube tluOw6sOkl4 >}}
</div>

The library can be injected multiple times, as it will return the unsuccessful load status, leading Windows to unload it from the process memory (this will only happen if the library is injected using the `LoadLibrary/CreateRemoteThread` method). Cheers x)

[1]: /project/tq-invincible "Project Page"