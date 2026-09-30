import React, { useState } from 'react';
import { GeneratedVariant } from '../../types';
import { ApiClient } from '../../services/apiClient';
import {
  Sparkles, Send, Smartphone, MessageSquare,
  Bell, Copy, Check, Globe, Wand2, Zap,
  RotateCcw, CheckCircle2, ShieldCheck, ArrowRight, CornerDownLeft, Bot, User
} from 'lucide-react';

// Mobile phone mock frame
function MobilePreview({ variant }: { variant: GeneratedVariant }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 280,
      margin: '0 auto',
      background: '#0a0a0f',
      borderRadius: 40,
      padding: '8px',
      border: '6px solid #1e293b',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)'
    }}>
      {/* Screen */}
      <div style={{
        background: '#0f172a',
        borderRadius: 34,
        overflow: 'hidden',
        minHeight: 480,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Status bar */}
        <div style={{
          background: '#000',
          padding: '10px 16px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>09:41</span>
          <div style={{
            width: 60,
            height: 16,
            background: '#000',
            borderRadius: '0 0 10px 10px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0
          }} />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: '#fff' }}>5G</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#fff' }}>100%</span>
          </div>
        </div>

        {/* Notification preview area */}
        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* App wallpaper hint */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05))',
            borderRadius: 16,
            padding: '10px',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            marginBottom: 4
          }}>
            <div style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center', marginBottom: 2 }}>
              {variant.channel} Preview
            </div>
          </div>

          {/* PUSH Notification */}
          {variant.channel === 'PUSH' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.93)',
              borderRadius: 16,
              padding: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.4s ease',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bell size={10} color="#fff" />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#4f46e5' }}>AetherTel</span>
                </div>
                <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>now</span>
              </div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>
                {variant.headline}
              </p>
              <p style={{ fontSize: '0.625rem', color: '#475569', lineHeight: 1.4, marginBottom: 8 }}>
                {variant.body}
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 700,
                textAlign: 'center',
                padding: '6px',
                borderRadius: 8
              }}>
                {variant.ctaText}
              </div>
            </div>
          )}

          {/* SMS */}
          {variant.channel === 'SMS' && (
            <div style={{
              background: '#1e293b',
              borderRadius: 16,
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '0.55rem', color: '#64748b', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                +27-135-PROMO
              </div>
              <div style={{
                background: '#0f172a',
                borderRadius: '10px 10px 10px 2px',
                padding: '10px',
                maxWidth: '85%'
              }}>
                <p style={{ fontSize: '0.65rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {variant.headline} {variant.body}
                </p>
                <span style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700, display: 'block', marginTop: 5 }}>
                  {variant.ctaText}
                </span>
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {variant.channel === 'WHATSAPP' && (
            <div style={{
              background: '#0d1b12',
              borderRadius: 16,
              padding: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                <MessageSquare size={10} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>AetherTel Business ✓</span>
              </div>
              <div style={{
                background: '#1a3a25',
                borderRadius: '10px 10px 10px 2px',
                padding: '10px',
                maxWidth: '90%'
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{variant.headline}</p>
                <p style={{ fontSize: '0.625rem', color: '#d1fae5', lineHeight: 1.4, marginBottom: 8 }}>{variant.body}</p>
                <div style={{ background: '#10b981', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '5px 8px', borderRadius: 6, textAlign: 'center' }}>
                  {variant.ctaText}
                </div>
              </div>
            </div>
          )}

          {/* Social Ad */}
          {variant.channel === 'SOCIAL_AD' && (
            <div style={{
              background: '#0f172a',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{
                height: 80,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600
              }}>
                AetherTel Sponsored
              </div>
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{variant.headline}</p>
                <p style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: 8 }}>{variant.body}</p>
                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '5px 8px', borderRadius: 6, textAlign: 'center' }}>
                  {variant.ctaText}
                </div>
              </div>
            </div>
          )}

          {/* CTR indicator */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>Est. CTR</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#34d399'
            }}>
              ~{variant.estimatedClickRate}%
            </span>
          </div>
        </div>

        {/* Home bar */}
        <div style={{ padding: '8px 0 12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 60, height: 4, background: '#334155', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  timestamp: string;
  type?: 'TEXT' | 'RECEIPT' | 'OPTIONS';
  options?: { label: string; value: string }[];
  receiptData?: {
    packName: string;
    price: string;
    ussdCode: string;
    txnId: string;
    validity: string;
  };
}

function WhatsAppChatbotSimulator({ initialHeadline, initialBody }: { initialHeadline: string; initialBody: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'BOT',
      text: `👋 ${initialHeadline}\n\n${initialBody}`,
      timestamp: '09:41 AM',
      type: 'OPTIONS',
      options: [
        { label: '1️⃣ Activate 10GB Data Pack (R29)', value: '1' },
        { label: '2️⃣ Claim 5GB eSIM Travel Pass', value: '2' },
        { label: '3️⃣ Check Account Balance', value: '3' },
        { label: '4️⃣ Speak with Enterprise Support', value: '4' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botMsg: ChatMessage;
      const cleanInput = userText.toLowerCase();
      const isNegative = ['dont', "don't", 'not', 'no', 'never', 'cancel', 'decline', 'stop', 'reject', 'disagree'].some(neg => cleanInput.includes(neg));

      if (isNegative) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: '👍 Understood! Request cancelled. No data pack has been activated on your mobile account.\n\nReply 1 if you change your mind, or 3 to check your balance.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'OPTIONS',
          options: [
            { label: '1️⃣ Activate 10GB Data Pack (R29)', value: '1' },
            { label: '3️⃣ Check Account Balance', value: '3' }
          ]
        };
      } else if (cleanInput === '1' || cleanInput.includes('10gb') || cleanInput.includes('activate') || cleanInput.includes('confirm') || cleanInput.includes('yes')) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: '🎉 SUCCESS! Your 10GB Student Data Pass has been successfully activated on your mobile account.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'RECEIPT',
          receiptData: {
            packName: '10GB Student 5G Data Pack',
            price: 'R29 ZAR',
            ussdCode: '*135*29#',
            txnId: `TXN-2026-${Math.floor(Math.random()*8999+1000)}`,
            validity: '7 Days'
          }
        };
      } else if (cleanInput === '2' || cleanInput.includes('esim') || cleanInput.includes('travel')) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: '✈️ WELCOME TRAVEL PASS! Your 5GB eSIM configuration key is active: [eSIM-ZA-5G-88192]. Seamless 5G roaming enabled nationwide!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (cleanInput === '3' || cleanInput.includes('balance')) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: '📊 ACCOUNT TELEMETRY BALANCE:\n• 5G Data Remaining: 14.2 GB\n• Network Status: OPTIMAL\n• Expiry: 14 Oct 2026',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (cleanInput === '4' || cleanInput.includes('support') || cleanInput.includes('help')) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: '👨‍💼 Connecting you with AetherTel Enterprise Support Desk... A representative will join this chat within 60 seconds.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: `🤖 AI Assistant Answer: Thank you for inquiring about "${userText}". High-Speed 5G coverage is active in your sector. Reply 1 to activate 10GB Data Pack @ R29!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'OPTIONS',
          options: [
            { label: '1️⃣ Activate 10GB Data Pack (R29)', value: '1' },
            { label: '2️⃣ Claim 5GB eSIM Travel Pass', value: '2' }
          ]
        };
      }

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-01',
        sender: 'BOT',
        text: `👋 ${initialHeadline}\n\n${initialBody}`,
        timestamp: '09:41 AM',
        type: 'OPTIONS',
        options: [
          { label: '1️⃣ Activate 10GB Data Pack (R29)', value: '1' },
          { label: '2️⃣ Claim 5GB eSIM Travel Pass', value: '2' },
          { label: '3️⃣ Check Account Balance', value: '3' },
          { label: '4️⃣ Speak with Enterprise Support', value: '4' }
        ]
      }
    ]);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 320,
      margin: '0 auto',
      background: '#090d16',
      borderRadius: 36,
      padding: '8px',
      border: '6px solid #10b981',
      boxShadow: '0 20px 60px rgba(16, 185, 129, 0.25)'
    }}>
      {/* Phone Screen Frame */}
      <div style={{
        background: '#0b141a',
        borderRadius: 30,
        overflow: 'hidden',
        height: 480,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* WhatsApp Header */}
        <div style={{
          background: '#128c7e',
          padding: '10px 12px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#075e54', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                AetherTel 5G <CheckCircle2 size={11} style={{ color: '#34d399' }} />
              </div>
              <div style={{ fontSize: '0.55rem', color: '#a7f3d0' }}>
                {isTyping ? 'typing...' : 'Verified Business Bot (Online)'}
              </div>
            </div>
          </div>
          <button onClick={handleResetChat} title="Reset Chatbot Simulation" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, padding: '4px 6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.6rem' }}>
            <RotateCcw size={10} /> Reset
          </button>
        </div>

        {/* Chat Bubbles Container */}
        <div style={{ flex: 1, padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, background: '#0b141a' }}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'BOT';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isBot ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  maxWidth: '88%',
                  padding: '8px 10px',
                  borderRadius: isBot ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                  background: isBot ? '#1f2c34' : '#005c4b',
                  color: '#e9edef',
                  fontSize: '0.68rem',
                  lineHeight: 1.4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                  {/* Receipt Card */}
                  {msg.receiptData && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(16, 185, 129, 0.15)', padding: 6, borderRadius: 6 }}>
                      <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.65rem' }}>{msg.receiptData.packName}</div>
                      <div style={{ fontSize: '0.6rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>USSD: {msg.receiptData.ussdCode}</div>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: 2 }}>Txn: {msg.receiptData.txnId}</div>
                    </div>
                  )}

                  {/* Option Buttons */}
                  {msg.options && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(opt.value)}
                          style={{
                            background: '#128c7e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: '0.5rem', color: '#8696a0', textAlign: 'right', marginTop: 3 }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ background: '#1f2c34', padding: '6px 10px', borderRadius: '0px 12px 12px 12px', width: 60, fontSize: '0.6rem', color: '#8696a0' }}>
              typing...
            </div>
          )}
        </div>

        {/* WhatsApp Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          style={{ padding: '8px', background: '#1f2c34', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <input
            type="text"
            placeholder="Reply 1, 2, 3 or ask bot..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              background: '#2a3942',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: '0.68rem',
              color: '#fff',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#00a884',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}

export const AiContentStudioModule: React.FC = () => {
  const [campaignType, setCampaignType] = useState<string>('Student Data Special');
  const [targetLanguage, setTargetLanguage] = useState<string>('isiZulu');
  const [channel, setChannel] = useState<'SMS' | 'PUSH' | 'WHATSAPP' | 'SOCIAL_AD'>('PUSH');
  const [tone, setTone] = useState<'URGENT' | 'EXCLUSIVE' | 'CASUAL' | 'PROFESSIONAL'>('URGENT');
  const [customPrice, setCustomPrice] = useState<string>('R29');
  const [customLocation, setCustomLocation] = useState<string>('University Campus');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [variants, setVariants] = useState<GeneratedVariant[]>([
    {
      variantId: 'var-demo-01',
      headline: '🎓 Isipesheli Sabafundi: 10GB ngo-R29 Nje!',
      body: 'Jabulela inthanethi yesivinini se-5G khona manje khamphasini yakho. Ishesha ngendlela emangalisayo!',
      ctaText: 'Yenza kusebenze manje *135#',
      estimatedClickRate: 6.8,
      characterCount: 98,
      language: 'isiZulu',
      channel: 'PUSH',
      tone: 'URGENT'
    },
    {
      variantId: 'var-demo-02',
      headline: '⚡ Instant Unlock: 10GB Student Data Special',
      body: 'Enjoy blazing-fast 5G at University Campus. Tap below to claim your bonus 2GB rollover data.',
      ctaText: 'Claim Data Pack',
      estimatedClickRate: 7.4,
      characterCount: 124,
      language: 'English',
      channel: 'PUSH',
      tone: 'URGENT'
    }
  ]);

  const [selectedVariant, setSelectedVariant] = useState<GeneratedVariant>(variants[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [demoTab, setDemoTab] = useState<'MOBILE' | 'WHATSAPP_BOT'>('WHATSAPP_BOT');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDispatchSuccess(false);
    try {
      const res = await ApiClient.generateCopyVariants({
        campaignType, targetLanguage, channel, tone, customLocation, customPrice
      });
      setVariants(res.variants);
      setSelectedVariant(res.variants[0]);
    } catch (e) {
      console.warn('Fallback generation mode:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDispatch = async (variant: GeneratedVariant) => {
    await ApiClient.dispatchCampaign({
      title: `${variant.language} ${campaignType}`,
      category: campaignType.toLowerCase().includes('student') ? 'STUDENT_HYPERLOCAL' : 'AIRPORT_ROAMING',
      channel: variant.channel as any,
      targetLanguage: variant.language,
      headline: variant.headline,
      body: variant.body
    });
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 4000);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Success Banner */}
      {dispatchSuccess && (
        <div className="alert alert-success">
          <Sparkles size={16} style={{ flexShrink: 0 }} />
          <span>Multilingual campaign copy queued in Omnichannel Dispatch Engine!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid-split-7-5">
        {/* Left: Generator */}
        <div className="space-y-4">
          {/* Controls Panel */}
          <div className="card" style={{ padding: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wand2 size={16} style={{ color: '#c084fc' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Multilingual AI Copy Studio
                  </h3>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>LLM-powered localized marketing copy generation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} style={{ color: '#c084fc' }} />
                <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>10+ Languages</span>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Campaign Offer Preset</label>
                <select value={campaignType} onChange={(e) => setCampaignType(e.target.value)} className="form-select">
                  <option value="Student Data Special">Student Data Special (10GB @ R29)</option>
                  <option value="Airport Travel Roaming Pass">Airport Travel Roaming Pass</option>
                  <option value="B2B Enterprise Dedicated Fiber">B2B Enterprise Dedicated Fiber</option>
                  <option value="Weekend Data Turbo Pass">Weekend Data Turbo Pass</option>
                  <option value="IoT Fleet Connectivity">IoT Fleet Connectivity</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Language</label>
                <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="form-select">
                  <option value="isiZulu">isiZulu (Zulu)</option>
                  <option value="isiXhosa">isiXhosa (Xhosa)</option>
                  <option value="Afrikaans">Afrikaans</option>
                  <option value="English">English</option>
                  <option value="Sepedi">Sepedi (Northern Sotho)</option>
                  <option value="Setswana">Setswana (Tswana)</option>
                  <option value="Hindi">Hindi</option>
                  <option value="French">French</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Channel Format</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 4,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: 4
                }}>
                  {(['PUSH', 'SMS', 'WHATSAPP', 'SOCIAL_AD'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: 7,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: 'none',
                        letterSpacing: '0.03em',
                        background: channel === ch ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                        color: channel === ch ? '#c084fc' : 'var(--text-muted)',
                        boxShadow: channel === ch ? '0 0 0 1px rgba(168, 85, 247, 0.3)' : 'none',
                        transition: 'all 0.15s ease',
                        fontFamily: 'var(--font-sans)'
                      }}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">AI Tone & Personality</label>
                <select value={tone} onChange={(e) => setTone(e.target.value as any)} className="form-select">
                  <option value="URGENT">Urgent & High-Impact</option>
                  <option value="EXCLUSIVE">VIP Exclusive</option>
                  <option value="CASUAL">Casual & Friendly</option>
                  <option value="PROFESSIONAL">Professional Enterprise</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Offer Price Token</label>
                <input type="text" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="form-input" placeholder="e.g. R29" />
              </div>

              <div className="form-group">
                <label className="form-label">Hyperlocal Location</label>
                <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} className="form-input" placeholder="e.g. University Campus" />
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-purple"
                style={{ gap: 8 }}
              >
                {isGenerating ? (
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'rotate 0.7s linear infinite' }} />
                ) : (
                  <Sparkles size={14} />
                )}
                {isGenerating ? 'Synthesizing Multilingual Copy...' : 'Generate AI Copy Variants'}
              </button>
            </div>
          </div>

          {/* Variants */}
          <div>
            <p className="section-label" style={{ marginBottom: 10 }}>
              Generated Copy Variants ({variants.length})
            </p>
            <div className="space-y-3">
              {variants.map((v, idx) => {
                const isSelected = selectedVariant.variantId === v.variantId;
                return (
                  <div
                    key={v.variantId}
                    onClick={() => setSelectedVariant(v)}
                    className={`card cursor-pointer ${isSelected ? 'card-selected' : ''}`}
                    style={{ padding: 16 }}
                  >
                    <div className="flex items-start justify-between gap-3" style={{ marginBottom: 10 }}>
                      <div className="flex items-center gap-2">
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.25)',
                          color: '#c084fc',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          Variant {String.fromCharCode(65 + idx)}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{v.language}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {v.channel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#34d399'
                        }}>
                          ~{v.estimatedClickRate}% CTR
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(`${v.headline}\n${v.body}`, v.variantId); }}
                          style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 4 }}
                        >
                          {copiedId === v.variantId
                            ? <Check size={14} style={{ color: '#34d399' }} />
                            : <Copy size={14} />
                          }
                        </button>
                      </div>
                    </div>

                    <h5 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      marginBottom: 6,
                      lineHeight: 1.3
                    }}>
                      {v.headline}
                    </h5>
                    <p style={{
                      fontSize: '0.775rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 10
                    }}>
                      {v.body}
                    </p>

                    <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                      <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>
                        CTA: {v.ctaText}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDispatch(v); }}
                        className="btn btn-primary btn-xs"
                      >
                        <Send size={11} />
                        Queue Dispatch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Mobile Preview / WhatsApp Bot */}
        <div>
          <div className="card" style={{ padding: 20 }} >
            <div className="flex items-center justify-between" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setDemoTab('WHATSAPP_BOT')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background: demoTab === 'WHATSAPP_BOT' ? '#10b981' : 'transparent',
                    color: demoTab === 'WHATSAPP_BOT' ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  💬 Live WhatsApp Bot
                </button>
                <button
                  onClick={() => setDemoTab('MOBILE')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background: demoTab === 'MOBILE' ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                    color: demoTab === 'MOBILE' ? '#c084fc' : 'var(--text-muted)'
                  }}
                >
                  📱 Channel Mock
                </button>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.06em'
              }}>
                {selectedVariant.channel} · {selectedVariant.language}
              </span>
            </div>

            {demoTab === 'WHATSAPP_BOT' ? (
              <WhatsAppChatbotSimulator initialHeadline={selectedVariant.headline} initialBody={selectedVariant.body} />
            ) : (
              <MobilePreview variant={selectedVariant} />
            )}

            {/* Character count */}
            <div style={{
              marginTop: 16,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Character Count</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: selectedVariant.characterCount > 160 ? '#fbbf24' : '#34d399'
              }}>
                {selectedVariant.characterCount} chars
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
