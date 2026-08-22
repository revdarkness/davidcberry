---
title: "The AI that grades student work never leaves my house."
standfirst: "My own classroom policy has a hard line in it: no student personally identifiable information goes into public AI tools. That line applies to me at least as much as it applies to a fifteen year old. So I had to either stop using the tools on student work, or move the tools."
description: "A working case study in keeping student data local: the threat, the decision, the build, how it was verified, and the risk that is still sitting there. Local LLM inference on a two-GPU node, with the failure behavior written down in advance."
pubDate: 2026-08-16
topic: ai-governance
kind: essay
readingTime: "13 min read"
featured: true
---
<p>This is a case study rather than an opinion piece. It follows the shape I would want if someone handed me their work to evaluate: here is the exposure, here is why the obvious fixes did not close it, here is what I actually built, here is how I verified it does what I claim, and here is the risk that is still sitting there unaddressed.</p>

<p>The last section is the one that matters. Anyone can describe a control. A control nobody tested is a belief, and a control with no stated residual risk is a sales pitch.</p>

<h2>The exposure, stated precisely</h2>

<p>"AI and student privacy" is usually discussed at a level of abstraction where nothing can be decided. Three specific things were actually wrong.</p>

<p><strong>One. Student free text is the payload, and free text does not de-identify.</strong> The useful part of grading with a model is exactly the part that carries the risk: the student's own writing. A design justification, a lab writeup, a reflection on why the first prototype failed. Strip the name off the header and the body still says "Reem and I decided," still describes a specific kid's specific reasoning, still occasionally contains the thing they told you about their week. Redacting structured fields is easy. Redacting prose reliably, at volume, at eleven at night, is not.</p>

<p><strong>Two. The second-order path most people never map.</strong> The moment you build an assistant that can query your own systems, every plaintext free-text column in those systems is reachable by a model, whether or not you ever intended to send that data anywhere. The control is not only "do not paste student work into a chatbot." It is also "do not store student free text in the clear anywhere an agent can read it." I wrote that rule down after tracing it, not before.</p>

<p><strong>Three. The policy version of this control does not survive contact with a grading pile.</strong> A rule that says staff must not put student work into AI tools is enforced by nothing except teacher willpower, and it is tested hardest at the worst possible moment: a hundred and forty submissions, a Sunday night, a personal account that nobody is auditing. A control that depends on a tired human choosing the slower path every single time is not a control. It is a wish.</p>

<div class="lede-rule">
  <b>Design rule I took from this.</b>
  <span>Write the control as a statement about where the data can go, not as a statement about how careful people will be. The first one can be verified. The second one cannot.</span>
</div>

<h2>Why the usual answers did not close it</h2>

<p>Three standard answers exist, and all three are reasonable. None of them closed this particular gap.</p>

<p><strong>A vendor agreement.</strong> A signed data processing agreement is a real and useful thing, and it does move liability. It does not remove the exposure; it relocates it into someone else's infrastructure, under terms that vary by pricing tier and get revised on their schedule. It also has to be procured, and district procurement does not move at the speed of a teacher who needs to grade this week. Worth having. Not sufficient by itself, and not available to me on a personal timeline.</p>

<p><strong>De-identification before sending.</strong> Covered above. It works for fields and fails for prose, and a control that fails silently on the exact cases that matter most is worse than no control, because it produces confidence.</p>

<p><strong>Simply not using the tools.</strong> This is the honest option, and I want to be fair to it. It is also the option that leaves the workload exactly where it was and quietly pushes the practice into the shadows, where a teacher uses a personal account on personal hardware with no policy attached at all. Prohibition without an alternative does not produce abstinence. It produces unlogged usage.</p>

<h2>The decision: move the compute, not the data</h2>

<p>If the problem is that student writing has to travel to reach a model, then put a model where the student writing already is. The data stops moving. The control becomes a network fact rather than a behavioral promise, and network facts can be tested.</p>

<p>That is the entire idea. Everything after this is implementation detail.</p>

<h2>What I built</h2>

<p>I call the machine ANVIL, because the assistant that runs my day is called FORGE and I was not going to pass that up. It is a repurposed dual-boot workstation, Linux primary, with two consumer graphics cards totalling 24GB of video memory. No new hardware was purchased to prove this out, which is part of the point.</p>

<p><strong>Network.</strong> The node joins a private mesh VPN. Every service port binds to the VPN interface only. Nothing listens on a public address, SSH is key-only, and the box can be woken remotely by the control-plane machine so it is not burning power all day.</p>

<p><strong>Serving.</strong> vLLM runs a 32-billion-parameter instruction-tuned model, AWQ quantized, tensor-parallel across both cards. It exposes an OpenAI-compatible API. That last detail is the load-bearing one for anybody thinking about doing this: because the interface is the same shape as the commercial one, switching a tool from a vendor endpoint to my own is a change of base URL and API key, not a rewrite. A second, lighter serving lane runs small models for quick or non-sensitive work.</p>

<p><strong>Split of responsibility.</strong> My desktop stays the control plane and the GPU node stays muscle. It is not a second copy of my assistant, it is a service my assistant calls. That keeps exactly one place where decisions get made and exactly one place where student data is processed, which is worth more than any performance consideration.</p>

<p><strong>The bridge, and the detail I did not expect.</strong> The tool that hands work to the node is deliberately boring: standard library only, reads the student work from disk, calls the node, writes the output to a file. What it does not do is print the work, or the model's response, to the console.</p>

<p>That was not the original design. It became the design once I noticed that the console is itself a channel. A transcript gets scrolled past, copied into a bug report, pasted into a message. If the pipeline is silent about content and only reports status, then the number of places student prose can end up drops to one, and that one place is a file I control. The same lesson arrived again from a completely different direction some weeks later, when I watched a secret get echoed back to me by an error message from a command that had been rejected. Error channels and log channels leak. Design as if they will.</p>

<h2>Verification</h2>

<p>What I claimed had to be shown, so here is what was actually tested rather than assumed.</p>

<ul>
  <li><strong>The endpoint answers from the control plane, and the model produces usable work.</strong> Baseline, and the easy one.</li>
  <li><strong>The service does not answer on the box's own loopback address.</strong> This is the check that separates "I configured it privately" from "it is private." The port is published on the mesh interface specifically, so a request to localhost on the machine itself gets nothing. I found this out by trying it, which is the correct order of operations.</li>
  <li><strong>It survives a reboot.</strong> The container restarts unless explicitly stopped, and the model weights are cached locally so a restart does not re-download 20GB. A control that requires a human to remember to turn it back on will eventually be off.</li>
  <li><strong>Two real workflows were cut over</strong>, the grading assistant and the feedback writer, and exercised against genuine student work rather than a demo prompt.</li>
</ul>

<p>One related discipline is worth stealing, and I learned it on a different system entirely. When I later set up a monitor that was supposed to alert me if a particular URL ever started serving again, I did not trust it just because it showed green. I cloned it, pointed the clone at a URL I knew returned success, and confirmed the clone reported failure. Then I deleted the clone. A detector that has never been observed firing is not a detector, it is a decoration. Prove your alarms can go off.</p>

<h2>Residual risk</h2>

<p>Here is what this does not solve. If you take nothing else from this piece, take the habit of writing this section.</p>

<p><strong>The context window is 4096 tokens.</strong> That is the honest cost of running a 32B model on 24GB of consumer video memory, and it is a real constraint, not a footnote. Long documents get split and graded in sections. It works, and it is worse than not having to.</p>

<p><strong>There is no headroom for a second model.</strong> The grading model consumes essentially all available memory. A fast triage model in front of the good one, or a long-context agent alongside it, are both blocked until the hardware changes. I have a specific upgrade requirement written down because of this rather than a vague wish for a better machine.</p>

<p><strong>It is one node with no redundancy, and the failure behavior is the important part.</strong> When the node is down, the rule is stop, report, and ask. There is no automatic failover to a commercial API when real student data is in flight. I want to be blunt about why: a silent fallback would undo the entire control at the exact moment nobody is watching, and it would do so in the name of convenience. The system is allowed to refuse. I grade by hand that night.</p>

<p><strong>The model is not as sharp as a frontier model.</strong> It is good. It is not the best thing available, and pretending otherwise would be dishonest. This is why the human stays the grader of record and every output is treated as a draft, which is a position I would hold even with a perfect model.</p>

<p><strong>Monitoring on this endpoint is currently paused</strong>, left over from a maintenance window, and an unmonitored control degrades silently. I am naming it because unnamed gaps are exactly how a working control quietly stops working. It goes back on.</p>

<p><strong>It is a home lab, not a district system.</strong> No high availability, no formal change management, no second administrator. It is a proof that the approach works and a demonstration of what the controls should look like. It is not a procurement recommendation, and anyone reading it as one is reading it wrong.</p>

<h2>Where this sits in a governance framework</h2>

<p>If you have to map this to something like the NIST AI Risk Management Framework, and increasingly people do, it lands cleanly.</p>

<table>
  <thead>
    <tr><th>Function</th><th>What it looks like here</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Govern</strong></td><td>A written classroom policy with three hard lines, one of which is student PII. Stated failure behavior. A decision log that is append-only, so past reasoning cannot be quietly rewritten.</td></tr>
    <tr><td><strong>Map</strong></td><td>The exposure traced to specific paths: prose sent to a vendor, plaintext columns reachable by an agent, and a policy dependent on human diligence under load.</td></tr>
    <tr><td><strong>Measure</strong></td><td>Verification performed rather than assumed, including a negative test that the service is unreachable where it should be unreachable, and a detector proven capable of firing.</td></tr>
    <tr><td><strong>Manage</strong></td><td>Data relocated rather than protected in transit, a refusal-by-default failure mode, human review retained as the decision authority, and residual risk documented instead of closed on paper.</td></tr>
  </tbody>
</table>

<h2>Five things worth taking, whatever your setting</h2>

<ol>
  <li><strong>Write the control as a fact about the data, not a promise about people.</strong> "It does not leave the building" is testable. "Staff will be careful" is not.</li>
  <li><strong>Compatible interfaces are what make this affordable.</strong> Because local serving stacks speak the same API shape as the commercial ones, moving a workflow is a configuration change. This is the single biggest reason local inference is now practical rather than a research project.</li>
  <li><strong>Test the negative case.</strong> Confirm the thing is unreachable from where it should be unreachable. Confirm your alarm can ring. Green lights that have never been challenged are decoration.</li>
  <li><strong>Decide the failure behavior before you need it, and make it refuse.</strong> Every silent fallback is a control that turns itself off under exactly the conditions it was built for.</li>
  <li><strong>Keep the human as the decision of record.</strong> Not because the model is bad, but because accountability that has been delegated to a system cannot be delegated back when someone asks who decided.</li>
</ol>

<hr>

<p>There is a plain-language version of this written for my own students and their families, over at <a href="https://www.stemageddon.com">the STEMAGEDDON program site</a>. Same system, none of the vocabulary, and it answers the question a parent actually asks, which is simply: where does my kid's work go.</p>

<p>If you want the classroom policy that this control exists to enforce, it is <a href="/ai-classroom-policy/">here, on one page, free</a>.</p>

<div class="callout">
  <div class="sec-label">// Free download</div>
  <h3>The one-page AI classroom policy.</h3>
  <p>The three permission stamps, the enforcement rule, and the three hard lines, including the student data line this whole build exists to hold.</p>
  <a href="/assets/ai-classroom-policy.pdf" class="btn btn-primary" download>Download the PDF</a>
  <a href="/#subscribe" class="btn btn-ghost" style="margin-left:8px">Get new posts by email</a>
</div>
