---
title: "Eighty people, three and a half hours, and the one thing I would change about how I taught agentic AI."
standfirst: "On Saturday I trained about eighty professionals to build with AI agents at an Agentic AI Foundation Dallas workshop. The labs held up. The presenter's setup did not, and the reason it did not is the same reason agent systems fail in production."
description: "An after-action from the AAIF Dallas hands-on workshop: what went right, the three things that went wrong at the front of the room, and why too many surfaces is an operational risk for agent systems as well as for presenters."
pubDate: 2026-10-31
topic: ai-governance
kind: essay
readingTime: "6 min read"
---

<p>On Saturday afternoon I ran a three and a half hour hands-on workshop for the Agentic AI Foundation's Dallas chapter. About eighty people came, on a Saturday, on Halloween, with their own laptops. The billing was a line I agree with completely: building a prototype is easy; making it reliable, observable, secure and production-ready is where the real engineering starts.</p>

<p>It went well. I want to write down what went wrong anyway, because what went wrong turned out to be the subject of the workshop.</p>

<h2>The setup</h2>

<p>The format was a twenty minute talk followed by about three hours of guided labs. Every attendee brought their own model: some ran local inference, others used Claude, Gemini, Bedrock or whatever subscription their employer pays for. The tool tying it together was goose, an open-source agent that will talk to almost any provider. The through-line was a pair of plain text files, <code>AGENTS.md</code> and <code>.goosehints</code>, which tell every agent in a project the same rules no matter which vendor built it.</p>

<p>That last point carried most of the weight. Once you have more than one agent, the question is less "which model is smartest" and more "how do I make several of them follow the same rules, and how do I find out when they did not."</p>

<h2>What went right</h2>

<p>The labs held up across providers, on hardware I had never seen and with models I did not choose. That was the risk I had worried about most, and it is the part that worked.</p>

<p>The part I did not expect was afterwards. A crowd of people stayed behind with questions, and the conversation kept going well past the end of the session. The requests were specific: more of this, presented online, and the lab materials published on GitHub so they could keep working through them at home. When a room asks for the source files, the material has done its job.</p>

<h2>What went wrong, at the front of the room</h2>

<p><strong>Too many surfaces.</strong> When something needed diagnosing live, I was moving between VS Code, a browser, Claude Code, a desktop app and a terminal. Every switch cost me my place, and it cost the room the thread. Nothing was broken, but the friction was real.</p>

<p><strong>The terminal ate my attention.</strong> I got lost in Git Bash more than once, typing paths by hand in front of eighty people while the actual subject, the agents, sat idle.</p>

<p><strong>The late addition did not earn its place.</strong> The night before, I added a demo using goose's desktop app. It did not help anyone understand orchestration better than what I already had, and having two ways to do the same thing made me second-guess the plan mid-session.</p>

<p>Nerves made all three worse. That is not an excuse; it is a design input. If the presenter's setup only works when the presenter is calm, it is not a robust setup.</p>

<h2>Why this is the same problem</h2>

<p>Read that list again and swap "presenter" for "agent system."</p>

<ul>
  <li><strong>Too many surfaces</strong> is an observability problem. If you have to visit five places to work out what your agents did, you will find out late, and under pressure you will not find out at all.</li>
  <li><strong>The terminal ate my attention</strong> is a toil problem. Every manual step in an operational path is a step someone will get wrong at the worst moment. The fix is to script it, name it, and stop doing it by hand.</li>
  <li><strong>The late addition</strong> is a change-control problem. Whatever goes in after the last full rehearsal is untested in exactly the conditions that matter. Production has a word for this, and the word is freeze.</li>
  <li><strong>Nerves</strong> is a stress-testing problem. A system you have only seen work on a quiet afternoon has not been tested. Plant a fault in the rehearsal and see whether you can find it.</li>
</ul>

<p>I did not plan for the workshop to demonstrate its own thesis. It did anyway.</p>

<h2>What I am changing</h2>

<p><strong>One window.</strong> Next time, VS Code is the whole stage: the agent chat, the browser, the terminal and the files, in one place. Attendees copy what the presenter's screen shows, so one surface teaches one mental model.</p>

<p><strong>No hand-typed shell on stage.</strong> Every terminal step becomes a named task that runs with one action.</p>

<p><strong>A feature freeze at the final rehearsal.</strong> Anything that comes up after that waits for the next event.</p>

<p><strong>Rehearse the failure, not the happy path.</strong> The next dry run includes one deliberately planted fault, because diagnosis is where this workshop got hard.</p>

<h2>What is still open</h2>

<p>Talking to goose from inside the same VS Code session, which is the piece that would make the one-window setup complete, does not work reliably yet. I am not putting it in front of a room until it does. And I did not personally get through every lab on the day, so tonight I am running all of them end to end, in one window, the way I should have rehearsed them.</p>

<p>Thank you to Govind Palaisamy and the AAIF Dallas chapter for organizing, to UT Dallas for giving us a lecture hall at no cost, to one of my own students who showed up and volunteered, to Datadog for feeding everyone, and to the eighty people who gave up a Saturday afternoon. You asked for videos and for the labs on GitHub. Both are coming, built the way this piece says they should be: one window.</p>
