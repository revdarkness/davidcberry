---
title: "Healthy and blind: the watchdog that watched nothing for six weeks."
standfirst: "In August I wrote that my backup monitor was offline. A few days later it came back, reporting healthy, and attached to no network at all. It stayed that way for six weeks. Two lessons came out of finding it, and the second one was not about monitoring."
description: "A follow-up to the six-day compromise write-up: the independent watchdog I described as offline came back running blind and stayed that way for six weeks, why its healthcheck never noticed, the one command that fixed it, and an access-path gap found on the way."
pubDate: 2026-10-17
topic: cyber
kind: essay
readingTime: "6 min read"
---

In August I [wrote about a compromise](/six-days-of-http-200/) that my site sat through for six days while returning HTTP 200 the whole time. Near the end of that piece I admitted something I was not proud of: the independent watchdog that exists to notice when my main monitoring host dies was itself offline, and had been for seventeen days.

That sentence was true when I wrote it. What happened after it is the more useful story.

## What I believed

I run two monitoring servers. The primary sits on the same machine as the services it watches, which means it cannot report that machine dying. So a second, small, separate machine runs its own copy, with one job: check on the primary, and alert my phone if it goes quiet.

In August that small machine dropped off my private network. I logged it as "offline," wrote it into the essay, and moved it onto a list of things to fix. A few days after the essay went up, the machine rebooted and came back. I did not notice for weeks. When I did, the monitoring web page still would not load, so the note became "machine back, watchdog still down, restart it."

## What was actually true

When I finally sat down to restart it, the machine had been up for 45 days without a reboot. The watchdog container was running. Docker reported it as **healthy**, and had been reporting that for six weeks.

It was also attached to no network at all. No interface beyond loopback, an empty routing table. From inside the container, every check failed the same way:

```
connect ENETUNREACH ... Network is unreachable
```

So for six weeks the watchdog had been doing exactly what it was configured to do. It ran its checks every sixty seconds, marked every target as failing, and tried to send alerts that had no route out of the box. The machine it lived on could reach everything fine. The process inside could reach nothing. And the only system asking whether it was okay was Docker's own healthcheck, which asked the process whether it was alive. It was.

<div class="lede-rule">
  <b>The finding, stated plainly.</b>
  <span>A healthcheck proves a process is alive. It does not prove the process can reach anything, and a monitor that cannot reach anything is indistinguishable from a monitor watching a quiet night.</span>
</div>

## The fix, and the fix that did not work

A restart changed nothing. The container came back up, still healthy, still disconnected. Whatever had detached it from its network had been persisted, and a restart faithfully restored the broken state.

Explicitly reattaching it to a network fixed it in one command. Within a minute my phone lit up with a burst of state changes as every check caught up with six weeks of reality. That burst was also the first proof in weeks that the alert path from that box to my phone worked end to end.

I still do not know what detached it. I would like to, but the more important point is that I will not have to find out by accident next time.

## Lesson one: watch the watcher from outside

In August I ended the essay with "watch the watcher, and check that too." I meant it, and I had not done it. I had put the watchdog on separate hardware, which handles the host dying. I had not put anything outside the watchdog that would notice the watchdog going blind, which is a different failure, and the one that actually happened.

The fix is cheap: each monitor now runs a check against the other. If either one loses its network, its process can stay as alive as it likes. The other one will see it stop answering.

The general version: any health signal that originates from inside the thing being checked can only tell you the thing is running. Reachability has to be proven from somewhere else.

## Lesson two: I did not know which door I was using

While I had the machine open I went through its settings on my private network, comparing it with the primary server it watches. They had been set up differently. The primary allows remote shell access through the same identity-checked path as everything else on that network. The small machine never had that switched on. For months I had been getting into it through a different login entirely, one I used without ever writing down, and never once asked myself which way I was getting in.

This is not what blinded the watchdog. It is a separate gap. But it is the same shape: a system that worked, quietly, in a way I had not looked at. Nothing was broken, so nothing prompted the question. An access path nobody has documented is an access path nobody reviews, and nobody revokes.

## What changed

- **Each monitor watches the other.** A blind watchdog now shows up as a failed check on the primary, and the reverse.
- **The alert path was proven, not assumed.** Six weeks of silence turned out to be six weeks of alerts with nowhere to go. A monitor that has never been seen to alert should be treated as unproven.
- **Every box's real access path gets written down,** and the small machine is being brought in line with the rest, so there is one way in, through one identity, that I can revoke from one place.

## What is still open

- I do not know why the container lost its network. The cross-check is what makes that tolerable.
- A related service on that machine listens more widely than it needs to: reachable from the home network, not just the private one. Low risk, already on the list, not yet fixed.

In August I wrote that I had known about the dead watchdog for days and not fixed it, and that this was a more honest sentence than any I could write about my detection posture. That sentence held for about a week. Then the watchdog came back, alive, healthy by its own account, and blind, which is worse than dead, because "dead" at least stays on a list.
