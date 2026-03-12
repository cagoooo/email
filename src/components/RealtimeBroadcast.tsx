import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

interface BroadcastMessage {
    id: string;
    student_id: string;
    points: number;
    type: string;
}

export const RealtimeBroadcast = () => {
    const [messages, setMessages] = useState<BroadcastMessage[]>([]);

    useEffect(() => {
        const handleBroadcast = (event: any) => {
            const { student_id, points, type } = event.detail;
            const newMessage = {
                id: Math.random().toString(36).substr(2, 9),
                student_id,
                points,
                type
            };

            setMessages((prev) => [newMessage, ...prev].slice(0, 3));

            // 5 秒後自動消失
            setTimeout(() => {
                setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
            }, 5000);
        };

        window.addEventListener('live_broadcast', handleBroadcast);
        return () => window.removeEventListener('live_broadcast', handleBroadcast);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_15px_rgba(var(--primary),0.1)] min-w-[240px]"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            {msg.points > 100 ? (
                                <Trophy className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Zap className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">校園快訊</span>
                            <p className="text-sm font-bold truncate max-w-[160px]">
                                <span className="text-primary italic">@{msg.student_id.split('@')[0]}</span>
                                剛獲得了 <span className="text-accent underline font-mono">+{msg.points}</span> 分！
                            </p>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="ml-auto"
                        >
                            <Star className="w-4 h-4 text-accent fill-accent" />
                        </motion.div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
