import { FormEvent, useState } from 'react';

type Message = { role: 'assistant' | 'user'; text: string };

const replyFor = (value: string) => {
  const text = value.toLowerCase();
  if (text.includes('语音') || text.includes('voice') || text.includes('麦克风')) return '在 E 方向检测时，可以点击“使用语音作答”，然后说“上、下、左、右”或“看不清”。首次使用需要允许浏览器使用麦克风。';
  if (text.includes('色盲') || text.includes('色彩') || text.includes('colour') || text.includes('color')) return '色彩探索会显示实验性点阵图。请选择你看到的数字，或选择“Cannot identify”。它不是临床色觉诊断。';
  if (text.includes('报告') || text.includes('report')) return '完成流程进入 Session and plan overview 后，点击“Generate report”即可下载本地 HTML 报告。';
  if (text.includes('相机') || text.includes('camera') || text.includes('校准') || text.includes('calibration')) return '你可以使用 Camera Test，也可以选择 Manual Demo。屏幕校准和距离校准完成后，才能开始 E 方向检测。';
  if (text.includes('结果') || text.includes('result')) return '检测结果只代表这次原型测试的实验数据，不能替代验光或眼科检查。';
  return '我可以帮助说明检测流程、语音作答、色彩探索和报告生成。你想了解哪一项？';
};

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: '你好，我是 VisionWell 助手。可以问我检测流程、语音、色彩测试或报告。' }]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    setMessages((current) => [...current, { role: 'user', text: value }, { role: 'assistant', text: replyFor(value) }]);
    setInput('');
  };

  return <div className={`chatbot${open ? ' is-open' : ''}`}>
    {open && <section aria-label="VisionWell chatbot" className="chatbot-panel">
      <header className="chatbot-header"><div><strong>VisionWell Assistant</strong><small>Browser-local help</small></div><button aria-label="Close chatbot" className="chatbot-close" onClick={() => setOpen(false)} type="button">×</button></header>
      <div aria-live="polite" className="chatbot-messages">{messages.map((message, index) => <div className={`chatbot-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}</div>
      <form className="chatbot-form" onSubmit={send}><input aria-label="Message" onChange={(event) => setInput(event.target.value)} placeholder="Ask about the test…" value={input} /><button aria-label="Send message" type="submit">↑</button></form>
    </section>}
    <button aria-expanded={open} aria-label={open ? 'Close chatbot' : 'Open chatbot'} className="chatbot-launcher" onClick={() => setOpen((value) => !value)} type="button"><span aria-hidden="true">✦</span>{!open && <span>Chat</span>}</button>
  </div>;
};
