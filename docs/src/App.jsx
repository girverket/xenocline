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

            {/* Why It Matters */}
            <section className="problem-section">
                <div className="container">
                    <h2 className="section-title">Why It Matters</h2>
                    <p className="section-subtitle">
                        Most data processing code starts as a simple function chain. That works until you need to branch, run steps in parallel, observe what happened, or test each step in isolation.
                    </p>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">🔀</div>
                            <h3>Conditional Routing</h3>
                            <p>Route data dynamically based on its content. Send invalid records to a dead-letter queue, branch by message type, or skip steps conditionally.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">⚡</div>
                            <h3>Parallel Execution</h3>
                            <p>Fan out to multiple processing branches and aggregate the results. Built-in support for parallel phase execution with merge points.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">👁️</div>
                            <h3>Observability</h3>
                            <p>Event handlers track every phase execution. Know which phases ran, in what order, and what they produced — without polluting your business logic.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">🧪</div>
                            <h3>Testability</h3>
                            <p>Each phase is an isolated, pure function. Test processing logic independently of routing, orchestration, and infrastructure.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">🔒</div>
                            <h3>Type Safety</h3>
                            <p>Full TypeScript support for inputs, outputs, and context. Catch type mismatches at compile time, not at 3 AM in production.</p>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">📦</div>
                            <h3>Composable</h3>
                            <p>Phases are plug-and-play. Swap, reorder, or extend pipeline behavior without touching existing code. Build a library of reusable processors.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Example */}
            <section className="demo-section">
                <div className="container">
                    <h2 className="section-title">A Pipeline in 30 Seconds</h2>
                    <p className="section-subtitle">
                        Define phases, connect them, and execute. Xenocline handles orchestration and lifecycle.
                    </p>
                    
                    <div className="code-block" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="code-line"><span className="code-comment">// 1. Define phases</span></div>
                        <div className="code-line">const addPhase = createPhase('AddOne', {`{`}</div>
                        <div className="code-line">  execute: async (input) =&gt; ({`{ value: input.value + 1 }`})</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line">const multiplyPhase = createPhase('Multiply', {`{`}</div>
                        <div className="code-line">  execute: async (input) =&gt; ({`{ value: input.value * 2 }`})</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line"><span className="code-comment">// 2. Connect into a pipeline</span></div>
                        <div className="code-line">const process = createProcess('MyPipeline', {`{`}</div>
                        <div className="code-line">  phases: {`{`}</div>
                        <div className="code-line">    add: createPhaseNode('add', addPhase,</div>
                        <div className="code-line">      {`{ next: [createConnection('to-multiply', 'multiply')] }`}),</div>
                        <div className="code-line">    multiply: createPhaseNode('multiply', multiplyPhase,</div>
                        <div className="code-line">      {`{ next: createTermination('done') }`})</div>
                        <div className="code-line">  {`}`}</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line"><span className="code-comment">// 3. Execute</span></div>
                        <div className="code-line">const beginning = createBeginning('begin', 'add');</div>
                        <div className="code-line">const [results] = await executeProcess(</div>
                        <div className="code-line">  process, beginning, {`{ input: { value: 10 } }`}</div>
                        <div className="code-line">);</div>
                        <div className="code-line"></div>
                        <div className="code-line"><span className="code-comment">// results['done'] === { value: 22 }</span></div>
                    </div>
                </div>
            </section>

            {/* Conditional Routing */}
            <section className="models-section">
                <div className="container">
                    <h2 className="section-title">Conditional Routing</h2>
                    <p className="section-subtitle">
                        Route data dynamically with decisions. No if/else chains — just declarative transitions.
                    </p>
                    <div className="code-block" style={{maxWidth: '800px', margin: '2rem auto'}}>
                        <div className="code-line"><span className="code-comment">// Route based on data content</span></div>
                        <div className="code-line">const routeDecision = createDecision('Route', async (output) =&gt; {`{`}</div>
                        <div className="code-line">  if (output.value &gt; 100) {`{`}</div>
                        <div className="code-line">    return [createConnection('to-big', 'bigHandler')];</div>
                        <div className="code-line">  {`}`}</div>
                        <div className="code-line">  return [createConnection('to-small', 'smallHandler')];</div>
                        <div className="code-line">{`}`});</div>
                        <div className="code-line"></div>
                        <div className="code-line">createPhaseNode('validate', validatePhase, {`{`}</div>
                        <div className="code-line">  next: [routeDecision]</div>
                        <div className="code-line">{`}`});</div>
                    </div>
                </div>
            </section>

            {/* Use Cases / Examples */}
            <section className="problem-section">
                <div className="container">
                    <h2 className="section-title">Real-World Examples</h2>
                    <p className="section-subtitle">
                        Three complete applications demonstrate xenocline solving real problems.
                    </p>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">📊</div>
                            <h3>ETL Pipeline</h3>
                            <p>Extract, validate, transform, and load records. Demonstrates conditional routing for invalid data, enrichment, normalization, and observability.</p>
                            <a href="https://github.com/girverket/xenocline/tree/main/examples/etl-pipeline" className="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer">
                                View Example →
                            </a>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">🤖</div>
                            <h3>AI/LLM Chain</h3>
                            <p>Chain LLM calls with classification, research, drafting, and review. Demonstrates multi-step reasoning pipelines with conditional routing.</p>
                            <a href="https://github.com/girverket/xenocline/tree/main/examples/llm-chain" className="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer">
                                View Example →
                            </a>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">💬</div>
                            <h3>Chatbot Handler</h3>
                            <p>Process chat messages through intent classification, FAQ lookup, support ticketing, and human escalation. Demonstrates shared post-processing and analytics.</p>
                            <a href="https://github.com/girverket/xenocline/tree/main/examples/chatbot" className="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer">
                                View Example →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quickstart / Docs */}
            <section className="demo-section">
                <div className="container">
                    <h2 className="section-title">Get Started</h2>
                    <p className="section-subtitle">
                        Read the docs and start building pipelines in minutes.
                    </p>
                    <div className="problem-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">🚀</div>
                            <h3>Quickstart Guide</h3>
                            <p>Build your first pipeline, add conditional routing, and observe execution with event handlers.</p>
                            <a href="https://github.com/girverket/xenocline/blob/main/docs/quickstart.md" className="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer">
                                Read Guide →
                            </a>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">📖</div>
                            <h3>API Reference</h3>
                            <p>Complete type signatures for every function: phases, nodes, transitions, aggregators, events.</p>
                            <a href="https://github.com/girverket/xenocline/blob/main/docs/api-reference.md" className="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer">
                                Read Reference →
                            </a>
                        </div>
                        <div className="problem-card">
                            <div className="problem-icon problem-icon-text">🏗️</div>
                            <h3>Architecture</h3>
                            <p>Understand the execution model: how nodes, transitions, and the process engine work together.</p>
                            <a href="https://github.com/girverket/xenocline/blob/main/docs/architecture.md" className="btn btn-secondary btn-small" target="_blank" rel="noopener noreferrer">
                                Read Docs →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="models-section">
                <div className="container">
                    <h2 className="section-title">Production-Ready</h2>
                    <div className="problem-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', textAlign: 'center'}}>
                        <div className="problem-card">
                            <h3 style={{fontSize: '2.5rem', margin: 0, color: 'var(--accent)'}}>369</h3>
                            <p style={{margin: '0.5rem 0 0'}}>Tests Passing</p>
                        </div>
                        <div className="problem-card">
                            <h3 style={{fontSize: '2.5rem', margin: 0, color: 'var(--accent)'}}>94%</h3>
                            <p style={{margin: '0.5rem 0 0'}}>Statement Coverage</p>
                        </div>
                        <div className="problem-card">
                            <h3 style={{fontSize: '2.5rem', margin: 0, color: 'var(--accent)'}}>0</h3>
                            <p style={{margin: '0.5rem 0 0'}}>Known Vulnerabilities</p>
                        </div>
                        <div className="problem-card">
                            <h3 style={{fontSize: '2.5rem', margin: 0, color: 'var(--accent)'}}>Apache-2.0</h3>
                            <p style={{margin: '0.5rem 0 0'}}>License</p>
                        </div>
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
