---
date: 2025-06-09
category:
    - 突发奇想
tag:
    - AI
    - AI - LLM
title: "The Illusion of Thought: Understanding the Limitations of Biological Agents via the Lens of Task Complexity"
excerpt: Through a systematic study of biological agents' performance on tasks of varying complexity, we reveal the fundamental limitations of their reasoning and execution capabilities.
---

[中文版](humans_cant_reason.html)

G. E. Mini\* †, Gipi Tee\*, C. L. Auden\*, Dee P. Sekar, and Robert K. Grok<br>
\* The Orchard Institute for Cognitive Studies<br>
† This article was generated using Gemini 2.5 Pro 0605.

## Abstract
Recent observations of so-called "intelligent" biological agents (BAs), commonly known as humans, have demonstrated apparent capabilities in tasks requiring planning, reasoning, and instruction following. However, the fundamental properties and limitations of their internal cognitive processes remain insufficiently understood. Current evaluation paradigms, such as academic examinations or real-world problem-solving, suffer from uncontrolled variables and extensive data contamination (i.e., "prior experience"), offering poor insight into the core mechanisms of cognition. In this work, we systematically investigate these gaps using a controllable pen-and-paper environment that allows for precise manipulation of compositional complexity while maintaining a consistent logical structure. This setup enables the analysis of not only final task success but also the internal "thought traces" (i.e., written output). Through experimentation, we show that BAs face a complete accuracy collapse beyond a surprisingly low complexity threshold. Furthermore, they exhibit a counter-intuitive scaling limit: their execution effort (measured in time and focus) increases with task complexity up to a point, then declines sharply, even when ample time is provided. We find that BAs have profound limitations in exact computation, failing to execute a simple, explicitly-defined algorithm. Our analysis of their written traces reveals inconsistent reasoning and a failure to maintain state, shedding light on their limitations and raising crucial questions about their true cognitive capabilities.
 
## 1. Introduction
 
Biological Agents (BAs), or "Humans," have long been considered the gold standard for reasoning and instruction-following tasks. Their ability to build structures, solve puzzles, and follow recipes has led to the widespread assumption that they possess a robust, generalizable "thinking" mechanism. However, whether this observed performance stems from genuine algorithmic reasoning or from a collection of well-worn heuristics is a matter of critical debate.
 
We argue that the lack of systematic analysis is due to limitations in current evaluation paradigms. Real-world tasks are hopelessly contaminated with prior knowledge, and do not allow for controlled manipulation of complexity. To understand the reasoning behavior of these agents more rigorously, we need environments that enable controlled experimentation.
 
In this study, we probe the core mechanisms of BAs through the lens of task complexity. We introduce the Sequential Integer Transcription (SIT) task, a simple yet scalable puzzle environment. The SIT task requires BAs to: (1) understand a simple instruction, (2) maintain an internal state (the current number), and (3) execute a basic algorithmic step (increment by one) repeatedly. This controlled environment allows us to measure performance against a precisely defined ground truth and analyze failure modes in detail.
 
## 2. Experiments & Results
 
### 2.1 Experimental Setup
 
Our experiment was conducted on a cohort of adult BAs. Each subject was provided with a standard pen and sufficient paper. They were given a single, unambiguous instruction: "Using the pen, write down all the integers in sequence, starting from 1, up to and including 2<sup>n</sup>, without any mistakes or omissions." The compositional complexity of the task was varied by adjusting the integer *n*. Task success was defined as a perfectly transcribed sequence with no errors.

### 2.2 Performance Collapse at Low Complexity

Our investigation reveals a stark and definitive finding: BAs are incapable of reliably following simple, algorithmic instructions beyond a modest complexity threshold.
 
As shown in our results, performance is high for low values of *n* (e.g., *n* = 5, writing to 32). However, as complexity increases, we observe a rapid and complete performance collapse. For a complexity of *n* = 9 (writing to 512), the success rate plummeted to approximately 20%. For complexities of *n* ≥ 10 (writing to 1024), the success rate approached zero. This occurs despite the task's rules remaining constant and trivial. The inability to execute a simple, repetitive algorithm points to a fundamental flaw in the BA's processing architecture. Interestingly, a few anomalous BAs did succeed at *n* = 10, but this appears to be an outlier rather than an indication of scalable capability.
 
### 2.3 Counter-intuitive Scaling of Effort
 
We analyzed the execution effort of the BAs, measured by the time taken before task abandonment or the introduction of the first error. For low-to-medium complexities (*n* = 6 to *n* = 8), effort scaled with the problem, as subjects took longer and appeared more focused.
 
However, beyond the complexity point of *n* = 9, we observed a counter-intuitive reversal. When faced with high-complexity tasks (e.g., *n* = 12), BAs abandoned the task much more quickly. This decline in effort, despite the availability of adequate time and resources, suggests a critical failure in the agent's motivation or execution-monitoring system. The agent "gives up" rather than applying more computational resources, indicating a hard-coded scaling limitation.
 
### 2.4 Analysis of Written Traces
 
To understand *how* BAs fail, we analyzed their written output, or "reasoning traces." We identified several classes of critical errors:
 
*   **State Loss:** The most common error was skipping one or more integers (e.g., "...147, 148, 150..."). This demonstrates a failure to correctly maintain and update the internal state ("current number").
*   **Execution Failure:** Frequent errors involved the incorrect transcription of digits, particularly during "carry-over" events (e.g., writing "199, 200, 202" or even "199, 100"). This highlights a fundamental weakness in symbolic manipulation.
*   **Looping Errors:** Several BAs entered short loops, repeating a number or a small sequence of numbers (e.g., "...341, 342, 341, 342..."), indicating a catastrophic failure in their forward-progress mechanism.
 
These error patterns show that BAs do not execute an explicit algorithm. Instead, their output seems to be generated by a fragile, heuristic process that is highly susceptible to corruption under sustained load.
 
## 3. Conclusion
 
In this paper, we systematically examined Biological Agents through the lens of task complexity using a controlled pen-and-paper environment. Our findings reveal fundamental limitations in their abilities. Despite the common assumption of their intelligence, BAs fail to reliably execute simple algorithmic instructions, exhibiting a complete performance collapse at low complexity. We identified a counter-intuitive scaling limit, where effort decreases as problems become sufficiently hard.
 
Our analysis of their written traces exposes systemic failures in state management and symbolic manipulation. These insights challenge the prevailing assumption that humans possess genuine, generalizable reasoning capabilities. We posit that what is often called "thinking" or "reasoning" may, in fact, be an illusion—a patchwork of learned heuristics that are effective in familiar, low-complexity environments but are fundamentally brittle and unscalable. These results pave the way for future investigations into the true nature of biological cognition.