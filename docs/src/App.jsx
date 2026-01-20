import React from 'react'

function App() {
    return (
        <div className="site">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-glow"></div>
                <div className="hero-content">
                    <div className="badge">Modular Processor Pipeline Framework</div>
                    <h1 className="title">Xenocline</h1>
                    <p className="tagline">
                        Build efficient, scalable data processing pipelines.
                        <br />
                        <span className="highlight">Modular. Type-safe. Event-driven.</span>
                    </p>
                    <div className="hero-actions">
                        <a href="https://www.npmjs.com/package/@girverket/xenocline" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                            npm install @girverket/xenocline
                        </a>
                        <a href="https://github.com/girverket/xenocline" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </header>

            {/* Problem Statement */}
            <section className="problem-section">
                <div className="container">
                    <h2 className="section-title">Why Processor Pipelines?</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">M</div>
                            <h3>Modularity</h3>
                            <p>Break complex workflows into reusable, testable processors. Each phase does one thing well.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">S</div>
                            <h3>Scalability</h3>
                            <p>Parallel execution, conditional branching, and aggregation built in from the ground up.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">O</div>
                            <h3>Observability</h3>
                            <p>Event handlers track every phase execution. Debug complex workflows with confidence.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Example */}
            <section className="demo-section">
                <div className="container">
                    <h2 className="section-title">Simple Pipeline Example</h2>
                    <p className="section-subtitle">
                        Define phases, connect them, and execute. Xenocline handles orchestration and lifecycle.
                    </p>
                    
                    <div className="code-block" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="code-line"><span className="code-comment">// Define your phases</span></div>
                        <div className="code-line">const addOnePhase = createPhase('AddOne', {`{`}</div>
                        <div className="code-line">  execute: async (input) =&gt; ({`{ value: input.value + 1 }`})</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line">const multiplyPhase = createPhase('Multiply', {`{`}</div>
                        <div className="code-line">  execute: async (input) =&gt; ({`{ value: input.value * 2 }`})</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line"><span className="code-comment">// Build the pipeline</span></div>
                        <div className="code-line">const process = createProcess('MyPipeline', {`{`}</div>
                        <div className="code-line">  phases: {`{`}</div>
                        <div className="code-line">    nodeA: createPhaseNode('nodeA', addOnePhase,</div>
                        <div className="code-line">      {`{ next: [createConnection('c1', 'nodeB')] }`}),</div>
                        <div className="code-line">    nodeB: createPhaseNode('nodeB', multiplyPhase,</div>
                        <div className="code-line">      {`{ next: createTermination('end') }`})</div>
                        <div className="code-line">  {`}`}</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line"><span className="code-comment">// Execute</span></div>
                        <div className="code-line">const [results] = await executeProcess(</div>
                        <div className="code-line">  process,</div>
                        <div className="code-line">  createBeginning('nodeA'),</div>
                        <div className="code-line">  {`{ input: { value: 10 } }`}</div>
                        <div className="code-line">);</div>
                        <div className="code-line"><span className="code-comment">// Result: {`{ value: 22 }`} ✓</span></div>
                    </div>
                </div>
            </section>

            {/* Core Concepts */}
            <section className="context-section">
                <div className="container">
                    <div className="context-header">
                        <h2 className="section-title">Core Concepts</h2>
                        <p className="section-subtitle">
                            Build complex workflows from simple, composable primitives.
                        </p>
                    </div>
                    
                    <div className="context-features">
                        <div className="context-feature">
                            <div className="feature-number">01</div>
                            <h3>Phases</h3>
                            <p>Self-contained processing units. Each phase transforms input to output with its own <code>execute</code> function.</p>
                        </div>
                        <div className="context-feature">
                            <div className="feature-number">02</div>
                            <h3>Nodes</h3>
                            <p>Wrap phases with routing logic. Connect nodes using <code>Connection</code>, <code>Decision</code>, or <code>Termination</code> transitions.</p>
                        </div>
                        <div className="context-feature">
                            <div className="feature-number">03</div>
                            <h3>Processes</h3>
                            <p>Orchestrate multiple nodes into a pipeline. The execution engine handles lifecycle, concurrency, and error propagation.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Parallel Execution & Aggregation */}
            <section className="routing-section">
                <div className="container">
                    <h2 className="section-title">Parallel Execution & Aggregation</h2>
                    <p className="section-subtitle">
                        Branch processing paths and merge results with AggregatorNodes.
                    </p>
                    
                    <div className="routing-demo">
                        <div className="routing-flow">
                            <div className="routing-input">
                                <div className="routing-icon routing-icon-text">IN</div>
                                <span>{`{ value: 10 }`}</span>
                            </div>
                            <div className="routing-arrow">
                                <div className="arrow-line"></div>
                                <div className="routing-signals">
                                    <span className="signal">nodeA: +1 → 11</span>
                                </div>
                            </div>
                            <div className="routing-output" style={{background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)'}}>
                                <div className="routing-icon routing-icon-text">×2</div>
                                <span>Path 1: × 2 → 22</span>
                            </div>
                        </div>
                        <div className="routing-flow" style={{marginTop: '1rem'}}>
                            <div className="routing-input" style={{visibility: 'hidden'}}>
                                <div className="routing-icon routing-icon-text">IN</div>
                                <span>{`{ value: 10 }`}</span>
                            </div>
                            <div className="routing-arrow" style={{visibility: 'hidden'}}>
                                <div className="arrow-line"></div>
                            </div>
                            <div className="routing-output" style={{background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)'}}>
                                <div className="routing-icon routing-icon-text">²</div>
                                <span>Path 2: ² → 121</span>
                            </div>
                        </div>
                        <div className="routing-flow" style={{marginTop: '1rem'}}>
                            <div className="routing-input" style={{visibility: 'hidden'}}>
                                <div className="routing-icon routing-icon-text">IN</div>
                                <span>{`{ value: 10 }`}</span>
                            </div>
                            <div className="routing-arrow">
                                <div className="arrow-line"></div>
                                <div className="routing-signals">
                                    <span className="signal">Aggregator</span>
                                </div>
                            </div>
                            <div className="routing-output">
                                <div className="routing-icon routing-icon-text">OUT</div>
                                <span>{`{ value: 143 }`}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="code-block" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="code-line"><span className="code-comment">// Branch to parallel paths</span></div>
                        <div className="code-line">const nodeA = createPhaseNode('nodeA', addOne, {`{`}</div>
                        <div className="code-line">  next: [</div>
                        <div className="code-line">    createConnection('c1', 'nodeB'),  <span className="code-comment">// Path 1</span></div>
                        <div className="code-line">    createConnection('c2', 'nodeC')   <span className="code-comment">// Path 2</span></div>
                        <div className="code-line">  ]</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line"><span className="code-comment">// Aggregate results</span></div>
                        <div className="code-line">const aggregator = createAggregator('Sum', {`{`}</div>
                        <div className="code-line">  aggregate: async (input) =&gt; {`{`}</div>
                        <div className="code-line">    count++;</div>
                        <div className="code-line">    sum += input.value;</div>
                        <div className="code-line">    if (count === 2) return {`{ status: 'Ready', output: { value: sum } }`};</div>
                        <div className="code-line">    return {`{ status: 'NotYetReady' }`};</div>
                        <div className="code-line">  {`}`}</div>
                        <div className="code-line">{`}`});</div>
                    </div>
                </div>
            </section>

            {/* Conditional Routing */}
            <section className="interactive-section">
                <div className="container">
                    <div className="interactive-content">
                        <div className="interactive-text">
                            <h2 className="section-title">Conditional Routing</h2>
                            <p className="section-subtitle">
                                Use Decision nodes to dynamically route based on output or context.
                            </p>
                            
                            <div className="code-block">
                                <div className="code-line">const decision = createDecision('check',</div>
                                <div className="code-line">  async (output, context) =&gt; {`{`}</div>
                                <div className="code-line">    if (output.value &gt; threshold) {`{`}</div>
                                <div className="code-line">      return createTermination('highValue');</div>
                                <div className="code-line">    {`}`}</div>
                                <div className="code-line">    return [createConnection('c1', 'nextNode')];</div>
                                <div className="code-line">  {`}`}</div>
                                <div className="code-line">);</div>
                                <div className="code-line"></div>
                                <div className="code-line">const nodeB = createPhaseNode('nodeB',</div>
                                <div className="code-line">  multiplyPhase,</div>
                                <div className="code-line">  {`{ next: [decision] }`}</div>
                                <div className="code-line">);</div>
                            </div>
                        </div>

                        <div className="interactive-features">
                            <div className="interactive-feature">
                                <span className="feature-icon feature-icon-text">C</span>
                                <div>
                                    <h4>Connections</h4>
                                    <p>Direct paths to the next node in the pipeline</p>
                                </div>
                            </div>
                            <div className="interactive-feature">
                                <span className="feature-icon feature-icon-text">D</span>
                                <div>
                                    <h4>Decisions</h4>
                                    <p>Conditional branching based on output or context</p>
                                </div>
                            </div>
                            <div className="interactive-feature">
                                <span className="feature-icon feature-icon-text">T</span>
                                <div>
                                    <h4>Terminations</h4>
                                    <p>End states with optional final transformation</p>
                                </div>
                            </div>
                            <div className="interactive-feature">
                                <span className="feature-icon feature-icon-text">A</span>
                                <div>
                                    <h4>Aggregators</h4>
                                    <p>Merge outputs from multiple parallel paths</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event System */}
            <section className="feedback-section">
                <div className="container">
                    <h2 className="section-title">Event-Driven Observability</h2>
                    <p className="section-subtitle">
                        Register handlers to monitor and react to every stage of pipeline execution.
                    </p>
                    
                    <div className="terminal-demo" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="terminal-header">
                            <span className="terminal-dot red"></span>
                            <span className="terminal-dot yellow"></span>
                            <span className="terminal-dot green"></span>
                            <span className="terminal-title">Event Log</span>
                        </div>
                        <div className="terminal-body">
                            <div className="terminal-line">
                                <span className="terminal-dim">[process:start]</span>
                                <span className="terminal-input"> MyPipeline</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[node:start]</span>
                                <span className="terminal-input"> nodeA</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[phase:start]</span>
                                <span className="terminal-input"> AddOne</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[phase:execute]</span>
                                <span className="terminal-success"> AddOne → {`{ value: 11 }`}</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[transition:start]</span>
                                <span className="terminal-input"> nodeA → nodeB</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[node:start]</span>
                                <span className="terminal-input"> nodeB</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[phase:execute]</span>
                                <span className="terminal-success"> MultiplyByTwo → {`{ value: 22 }`}</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[transition:terminate]</span>
                                <span className="terminal-success"> end</span>
                            </div>
                            <div className="terminal-line">
                                <span className="terminal-dim">[process:end]</span>
                                <span className="terminal-success"> Complete</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="code-block" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="code-line">const eventHandler = createEventHandler(async (event, context) =&gt; {`{`}</div>
                        <div className="code-line">  console.log(`[${`$`}{event.type}:${`$`}{event.stage}] ${`$`}{event.sourceId}`);</div>
                        <div className="code-line">  <span className="code-comment">// Log to database, metrics, APM...</span></div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line">await executeProcess(process, beginning, {`{`}</div>
                        <div className="code-line">  input: initialData,</div>
                        <div className="code-line">  eventHandlers: [eventHandler]</div>
                        <div className="code-line">{`}`});</div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="actions-section">
                <div className="container">
                    <h2 className="section-title">Use Cases</h2>
                    <p className="section-subtitle">
                        Xenocline is ideal for any scenario requiring structured, observable workflows.
                    </p>
                    
                    <div className="actions-features">
                        <div className="action-feature">
                            <span className="feature-icon feature-icon-text">E</span>
                            <div>
                                <h4>ETL Pipelines</h4>
                                <p>Extract, transform, and load data with parallel processing and aggregation</p>
                            </div>
                        </div>
                        <div className="action-feature">
                            <span className="feature-icon feature-icon-text">W</span>
                            <div>
                                <h4>Workflow Orchestration</h4>
                                <p>Multi-step business processes with conditional logic and error handling</p>
                            </div>
                        </div>
                        <div className="action-feature">
                            <span className="feature-icon feature-icon-text">H</span>
                            <div>
                                <h4>Event Handling</h4>
                                <p>Process streams of events through transformation and enrichment stages</p>
                            </div>
                        </div>
                        <div className="action-feature">
                            <span className="feature-icon feature-icon-text">M</span>
                            <div>
                                <h4>Middleware Chains</h4>
                                <p>Request/response pipelines with validation, authentication, and transformation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Start */}
            <section className="quickstart-section">
                <div className="container">
                    <h2 className="section-title">Get Started</h2>
                    
                    <div className="quickstart-steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Install</h4>
                                <code>npm install @girverket/xenocline</code>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Import</h4>
                                <code>import {`{ createProcess }`} from '@girverket/xenocline'</code>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Build</h4>
                                <code>Define phases, connect nodes, execute</code>
                            </div>
                        </div>
                    </div>
                    
                    <div className="quickstart-examples">
                        <h3>Key Exports</h3>
                        <div className="code-block">
                            <div className="code-line"><span className="code-comment">// Core building blocks</span></div>
                            <div className="code-line">import {`{`}</div>
                            <div className="code-line">  createPhase,           <span className="code-comment">// Define processing units</span></div>
                            <div className="code-line">  createPhaseNode,       <span className="code-comment">// Wrap phases with routing</span></div>
                            <div className="code-line">  createProcess,         <span className="code-comment">// Orchestrate nodes into pipeline</span></div>
                            <div className="code-line">  executeProcess,        <span className="code-comment">// Run the pipeline</span></div>
                            <div className="code-line">  </div>
                            <div className="code-line">  <span className="code-comment">// Transitions</span></div>
                            <div className="code-line">  createConnection,      <span className="code-comment">// Direct path to next node</span></div>
                            <div className="code-line">  createDecision,        <span className="code-comment">// Conditional branching</span></div>
                            <div className="code-line">  createTermination,     <span className="code-comment">// End state</span></div>
                            <div className="code-line">  createBeginning,       <span className="code-comment">// Entry point</span></div>
                            <div className="code-line">  </div>
                            <div className="code-line">  <span className="code-comment">// Advanced</span></div>
                            <div className="code-line">  createAggregator,      <span className="code-comment">// Merge parallel outputs</span></div>
                            <div className="code-line">  createAggregatorNode,  <span className="code-comment">// Aggregator node wrapper</span></div>
                            <div className="code-line">  createEventHandler     <span className="code-comment">// Monitor execution</span></div>
                            <div className="code-line">{`}`} from '@girverket/xenocline';</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Type Safety */}
            <section className="models-section">
                <div className="container">
                    <h2 className="section-title">Built with TypeScript</h2>
                    <p className="section-subtitle">
                        Full type safety for inputs, outputs, and context throughout your pipeline.
                    </p>
                    <div className="code-block" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="code-line">interface MyInput {`{`}</div>
                        <div className="code-line">  value: number;</div>
                        <div className="code-line">  metadata?: string;</div>
                        <div className="code-line">{`}`}</div>
                        <div className="code-line"></div>
                        <div className="code-line">interface MyOutput {`{`}</div>
                        <div className="code-line">  result: number;</div>
                        <div className="code-line">  processed: boolean;</div>
                        <div className="code-line">{`}`}</div>
                        <div className="code-line"></div>
                        <div className="code-line">const phase: Phase&lt;MyInput, MyOutput&gt; = createPhase('TypedPhase', {`{`}</div>
                        <div className="code-line">  execute: async (input: MyInput): Promise&lt;MyOutput&gt; =&gt; ({`{`}</div>
                        <div className="code-line">    result: input.value * 2,</div>
                        <div className="code-line">    processed: true</div>
                        <div className="code-line">  {`}`})</div>
                        <div className="code-line">{`}`});</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <h2>Build Better Pipelines</h2>
                    <p>Start orchestrating workflows with Xenocline today.</p>
                    <div className="cta-buttons">
                        <a href="https://www.npmjs.com/package/@girverket/xenocline" className="btn btn-primary btn-large" target="_blank" rel="noopener noreferrer">
                            Install from NPM
                        </a>
                        <a href="https://github.com/girverket/xenocline" className="btn btn-secondary btn-large" target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <p>Apache 2.0 License | Built by <a href="https://github.com/girverket">Girverket</a></p>
                </div>
            </footer>
        </div>
    )
}

export default App
