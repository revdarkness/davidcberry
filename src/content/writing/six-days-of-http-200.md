---
title: "My site returned HTTP 200 for every one of the six days it was compromised."
standfirst: "There was an operator on the other end, four webshells on disk, and three live command-and-control connections. The homepage loaded perfectly the entire time. This is what I built afterwards, what it cost to prove it works, and which parts of it are broken right now."
description: "A case study in detection: why uptime monitoring would have sat green through a six day compromise, the three monitors that replaced it, how each one was proven capable of failing, and the residual gaps that are still open."
pubDate: 2026-08-25
topic: cyber
kind: essay
readingTime: "14 min read"
featured: true
---
<p>This is a case study rather than a warning. It follows the same shape as the last one: here is what went wrong, here is why the obvious fix does not close it, here is what I actually built, here is how I proved it works, and here is what is still broken today.</p>

<p>The last section is again the one that matters. I am writing this three weeks after the incident, and in that time one of the monitors I am about to describe failed to fire when it should have. That is in here too. A detection write-up that ends with everything green is not a detection write-up; it is marketing.</p>

<h2>What happened, and why nothing noticed</h2>

<p>An opportunistic botnet found a WordPress REST endpoint that let it create administrator accounts without authenticating first. It made one, logged in as it three seconds later, and started working. This was not targeted at me. Two unrelated cloud hosts ran identical tooling against the site six days apart, which is what commodity exploitation looks like from the inside.</p>

<p>Over the next six days it came back four separate times. It dropped four webshells into a plugin directory, each one named to look like a plugin, because a directory full of plugin-shaped names is the best hiding place a WordPress install offers. Then, on day three, the tactics changed: two more administrator accounts were created and <strong>no files were written at all</strong>. The implants that session were fileless. If my entire detection strategy had been "scan for unexpected files," it would have caught the first four visits and been blind to the last one.</p>

<p>I found it on day six. Not because anything alerted me. I found it while preparing to install patches, which is to say I found it by accident, while doing the maintenance whose absence had let it in. When I looked properly, there were three live command-and-control connections open and an interactive attacker session on the box. Someone was there.</p>

<p>Here is the part I want to sit on. Through all six days:</p>

<ul>
  <li>The site returned HTTP 200.</li>
  <li>The homepage rendered normally.</li>
  <li>Every post and page resolved.</li>
  <li>Nothing was defaced, slowed, or visibly altered.</li>
  <li>No certificate expired, no disk filled, no service crashed.</li>
</ul>

<p>I was not running uptime monitoring that week, and I have to be honest that it would not have helped. Any uptime check I could have configured would have sat green for all six days and then reported a hard outage on the evening of day six, when I stopped the instance myself.</p>

<div class="lede-rule">
  <b>The finding, stated plainly.</b>
  <span>A status code tells you the server answered. It does not tell you what it answered with, and it does not tell you who else it is answering.</span>
</div>

<p>The site kept working because whoever was there wanted it to keep working. That is the whole economics of it. A defaced homepage gets noticed in an hour and fixed the same day. A quiet one gets used for months. Availability monitoring is aligned with the attacker's interests, not mine.</p>

<h2>Why "add monitoring" is the wrong lesson</h2>

<p>I did add monitoring. I am glad I did, and most of this piece is about it. But "add monitoring" is not the lesson, because the monitoring most people mean when they say that word is the monitoring that would have missed this.</p>

<p>The default posture, the one you get from every hosting dashboard and most status-page products, asks a single question: did the server respond. It is a liveness check wearing a security check's clothing. It is genuinely useful for the thing it does, which is telling you the machine fell over. It is close to useless for telling you the machine has been repurposed.</p>

<p>Two distinct claims are involved, and conflating them is the actual mistake:</p>

<table>
  <thead>
    <tr><th>Claim</th><th>What proves it</th></tr>
  </thead>
  <tbody>
    <tr><td>The site is up</td><td>A status code. Cheap, and the default everywhere.</td></tr>
    <tr><td>The site is doing what I think it is doing</td><td>An assertion about content, and an assertion about absence. Neither is default anywhere.</td></tr>
  </tbody>
</table>

<p>The second row is the one that catches a compromise, and almost nobody configures it, because it requires you to first write down what the site is supposed to be. That is work, and it is the work.</p>

<h2>What I built</h2>

<p>Three monitors, on a self-hosted monitoring service reachable only over a private mesh VPN. It is not exposed to the internet, which matters: a monitoring console on a public address is a map of your infrastructure with a login form attached.</p>

<h3>1. A keyword monitor instead of a status monitor</h3>

<p>The homepage check does not accept a 200. It fetches the page every sixty seconds and requires a specific string, one that belongs to my content, to be present in the response body. A blank page fails it. A defaced page fails it. A page quietly replaced with somebody else's content fails it, no matter how cheerfully it returns 200.</p>

<p>This is a one-line configuration change from the default and it converts a liveness check into a weak integrity check. Weak, because a smart attacker who leaves the homepage alone still passes it. It is not a strong control. It is a strictly better default, available to anyone, at no cost, and I would put it on every site I own.</p>

<h3>2. A canary that asserts absence</h3>

<p>This is the one worth stealing.</p>

<p>I know exactly which paths served webshells, because I have the forensics. So there is now a check that requests one of those paths every five minutes and <strong>accepts only HTTP 404</strong>. Anything else, a 200, a 403, a 500, a redirect, is a failure.</p>

<p>Green means the path is still gone. Red means something is answering there again.</p>

<p>It is the only monitor I own whose healthy state is a negative, and that inversion is the interesting part. Almost every check you will ever configure asks "is the good thing present." This one asks "is the bad thing still absent," and the two questions fail in completely different circumstances. A reinfection that restores the same tooling, which is common, because the tooling is commodity and so are the paths, trips this immediately while every availability check in the world stays green.</p>

<p>The generalization: <strong>after an incident, you know things about your attacker that you did not know before, and most of that knowledge expires unused.</strong> Paths, filenames, user agents, account naming patterns. Turning even one of them into a standing assertion converts a one-time cleanup into a permanent control.</p>

<h3>3. A push canary for the thing that has no URL</h3>

<p>Patch lag is how the site was taken. So the obvious follow-on control is "keep it patched," and automatic updates are the obvious implementation. The problem is that automatic updates have no endpoint. There is nothing to poll. They either quietly happen or quietly do not, and the failure mode is invisible for weeks.</p>

<p>So this one runs the other way round. A timer on the server checks for pending updates every thirty minutes and pushes a heartbeat out to the monitoring service. No pending updates pushes a healthy beat. Pending updates pushes a failure with a count.</p>

<p>The design detail that makes it worth building: <strong>one control covers two different failures.</strong></p>

<ol>
  <li><strong>Updates are pending and not installing.</strong> The push says so explicitly.</li>
  <li><strong>The update machinery itself has died.</strong> Then nothing gets pushed at all, and the monitor flips to failed on its own, because a heartbeat monitor's failure state is silence.</li>
</ol>

<p>The second case is the one that actually bit me, and I only know that because it happened after I built this.</p>

<h2>The control that had already stopped working</h2>

<p>Here is the sequence I did not expect, and it is the best argument in this piece.</p>

<p>After the rebuild I enabled automatic updates on everything. Then, three steps later in the same session, I imported the site database. The import overwrote the settings table, which is where that preference lives, and silently reverted it. I did not notice for three days. The live configuration was still naming a plugin that does not exist on the new host, which is the tell I eventually caught.</p>

<p><strong>Any setting that lives in your database is at risk from a database import.</strong> I have written a lot of configuration into a lot of databases and had never once thought of a restore as a control-reverting event. It is.</p>

<p>Then it got worse. Even with the preference re-applied, no scheduled task had run at all for six days. Two independent faults, stacked:</p>

<ul>
  <li>WordPress triggers its scheduler by making an HTTP request to itself. That loopback request was being blocked at the CDN, because the CDN rule keyed on the origin's own source address, which is exactly the address a loopback request comes from. The site was firewalling itself.</li>
  <li>Separately, the update hook was missing from the scheduled task list entirely, so even a working scheduler had nothing to run.</li>
</ul>

<p>Six days again. Different six days, different mechanism, same shape: <strong>a control I believed was in place, reporting nothing, doing nothing, and looking completely normal from outside.</strong></p>

<p>The fix was to stop using the self-request scheduler and drive it from a system timer instead, with the units under version control rather than living only on the box. But the fix is not the point. The point is that I found this because I went looking, not because anything told me. That is precisely the failure I had just spent a week remediating, reproduced by me, inside the remediation.</p>

<h2>Verification: proving an alarm can ring</h2>

<p>Every monitor above showed green when I finished configuring it. Green on a monitor you just built means almost nothing, because the most common way for a check to be wrong is for it to be trivially satisfiable. A keyword check with a typo in the keyword fails loudly, which is fine. A check pointed at the wrong thing, or one whose success condition is met by any response at all, sits green forever and feels like coverage.</p>

<p>So for the absence canary, the one whose entire job is to fail under conditions I have never actually observed, I tested it directly:</p>

<ol>
  <li>Cloned the monitor, with identical configuration.</li>
  <li>Pointed the clone at a URL I knew returned 200, my own homepage.</li>
  <li>Confirmed the clone reported <strong>failed</strong>, which is the correct behavior for a check that accepts only 404.</li>
  <li>Deleted the clone.</li>
</ol>

<p>Four steps, about five minutes. Now I know the difference between "this monitor is green" and "this monitor is green and is capable of being red." Before that test I had a belief. After it I had a control.</p>

<div class="lede-rule">
  <b>Steal this one.</b>
  <span>A detector that has never been observed firing is not a detector, it is a decoration. Make each of your alarms go off once, deliberately, at a time of your choosing.</span>
</div>

<p>There is a similar discipline that applies to permissions, and I learned it the same month on a different system: revoking a policy does not deactivate the credential that used it. I only know that because I tested the revocation by making a call that was supposed to fail, and it succeeded. Two separate controls, one console that does not connect them, and an assertion in a dashboard that was not true. Prove revocations by probing them. Prove alarms by ringing them. An assertion is not evidence.</p>

<h2>Where this sits in a framework</h2>

<p>If you have to map this to NIST Cybersecurity Framework 2.0, and increasingly people do, almost all of it lands in one function, which is itself the finding.</p>

<table>
  <thead>
    <tr><th>Function</th><th>What it looks like here</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Identify</strong></td><td>Forensics produced a concrete list of attacker artifacts. That list is an asset, and it is the input to everything below.</td></tr>
    <tr><td><strong>Protect</strong></td><td>Rebuild on a clean host, drastically reduced plugin count, origin reachable only from the CDN, no public administrative access. This is the part everyone does.</td></tr>
    <tr><td><strong>Detect</strong></td><td>Content assertion rather than status code. Absence assertion on known-bad paths. Heartbeat with silence as a failure state. Each one tested for its ability to fail. <strong>This is the function that was entirely missing during the incident, and its absence is why six days happened.</strong></td></tr>
    <tr><td><strong>Respond</strong></td><td>Containment by stopping the host, which severed the command-and-control channels and the live attacker session at the same moment. A forensic snapshot taken before any action.</td></tr>
    <tr><td><strong>Recover</strong></td><td>Rebuild rather than clean in place, because you cannot trust a filesystem an attacker has owned. Automatic snapshots enabled, the absence of which had made the forensic image also the only rollback.</td></tr>
  </tbody>
</table>

<p>Protect was not the gap. Protect is where all the attention goes, all the products point, and all the checklists live. The gap was Detect, and it stayed the gap for six days at full severity.</p>

<h2>Residual risk, current as of today</h2>

<p>This is the section I said matters. All of the following is true this morning, three weeks after the rebuild.</p>

<p><strong>A monitor I built did not fire.</strong> Four days ago a local inference service on a different machine died during a reboot and stayed dead for two days. It has a monitor. That monitor had been verified working three days earlier. I found the outage myself, by using the service, not by being told. I have not yet diagnosed why it stayed quiet, and until I do, everything in the verification section above applies to me as much as to anyone reading. <strong>A watch that does not fire is a second fault, and it is exactly the shape of the blind spot this entire piece is about.</strong></p>

<p><strong>Four monitors are sitting permanently red, and have been for weeks.</strong> Each one alerted once, when it changed state, and has been silent since. They are all real, all for hosts and services that genuinely are down, and none of them is urgent. That is the problem. A board with four permanent reds on it trains you to stop reading the board, which is the same failure as having no board, arrived at through diligence instead of neglect. Each one needs a decision, fix it or delete it, and "leave it red" is not one of the options.</p>

<p><strong>The thing that watches the watcher is itself down.</strong> My monitoring service cannot report its own host dying, which is obvious once said and easy to never say. So there is a second, independent watchdog on a small separate machine whose only job is to notice if the primary goes silent. That machine has been offline for seventeen days. So right now, if the primary monitoring host drops, nothing reaches my phone, and the board keeps looking mostly green because the thing that would have told me otherwise is the thing that died. I have known this for days and it is not yet fixed, which is a more honest sentence than any I could write about my detection posture.</p>

<p><strong>The site cannot send email at all.</strong> No local mail transport, and the provider blocks the classic mail port outbound. Nothing currently depends on it, so this is not urgent, but it means any future alerting path that runs through the site itself is dead on arrival, and I would not have discovered that during an incident at a convenient moment.</p>

<p><strong>A near miss worth recording, because it was mine.</strong> Four days after containment, while trying to stand the site back up, I created a new instance from the forensic snapshot instead of from a clean image, and it booted with a fully open firewall. Four webshells were internet-reachable, at the real domain name, for about twenty two minutes. I checked afterwards rather than assuming: the access log for that entire window contains three requests, all from my own address, and no scanner or probe ever arrived. Nobody found it. That is luck, not control. The procedural fix was to stop writing runbook steps that say to close ports "immediately after boot," because there is no immediately, and instead set the firewall while the instance is stopped, which makes the window zero rather than small.</p>

<h2>Five things worth taking</h2>

<ol>
  <li><strong>Decide what claim your monitoring makes.</strong> "It is up" and "it is doing what I think it is doing" are different claims requiring different checks. Most setups only buy the first and quietly believe they bought the second.</li>
  <li><strong>Turn incident knowledge into standing assertions.</strong> You learn specific things about an attacker during cleanup and then throw almost all of it away. One known-bad path, checked for absence forever, is the cheapest durable control I have ever built.</li>
  <li><strong>Build at least one check whose healthy state is a negative.</strong> It fails under conditions that no availability check will ever notice.</li>
  <li><strong>Ring every alarm once, on purpose.</strong> Clone it, point it at something you know will trip it, watch it go red, delete the clone. Five minutes converts a belief into a control.</li>
  <li><strong>Watch the watcher, and check that too.</strong> Monitoring cannot report its own death. Whatever you build to cover that, put it somewhere else, and then treat its silence as an alert rather than as calm.</li>
</ol>

<hr>

<p>The companion piece to this one is <a href="/student-data-stays-local/">the case study on keeping student work off vendor APIs</a>, which is where the local inference node mentioned above comes from, and which has its own residual risk section for the same reason this one does.</p>

<p>If you want the classroom policy that sits on top of all of it, it is <a href="/ai-classroom-policy/">here, on one page, free</a>.</p>
