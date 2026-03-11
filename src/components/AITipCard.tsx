import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Heart, AlertCircle, Sparkles, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AITip } from '@/lib/index';
import { springPresets } from '@/lib/motion';

interface AITipCardProps {
  tip: AITip;
  onDismiss: () => void;
}

const TIP_ICONS = {
  encouragement: Heart,
  hint: Lightbulb,
  correction: AlertCircle,
  celebration: Sparkles,
};

const TIP_COLORS = {
  encouragement: 'from-pink-500 to-rose-500',
  hint: 'from-yellow-500 to-amber-500',
  correction: 'from-orange-500 to-red-500',
  celebration: 'from-purple-500 to-indigo-500',
};

const TIP_BADGES = {
  encouragement: { text: '加油', color: 'bg-pink-100 text-pink-700' },
  hint: { text: '小提示', color: 'bg-yellow-100 text-yellow-700' },
  correction: { text: '注意', color: 'bg-orange-100 text-orange-700' },
  celebration: { text: '太棒了', color: 'bg-purple-100 text-purple-700' },
};

export function AITipCard({ tip, onDismiss }: AITipCardProps) {
  const Icon = TIP_ICONS[tip.type];
  const colorClass = TIP_COLORS[tip.type];
  const badge = TIP_BADGES[tip.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={springPresets.gentle}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-gradient-to-br ${colorClass} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${badge.color}`}>
                    {badge.text}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="h-6 w-6 p-0 hover:bg-muted/50"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-sm text-foreground leading-relaxed">
                  {tip.message}
                </p>
                
                {tip.type === 'celebration' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, ...springPresets.bouncy }}
                    className="flex justify-center"
                  >
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ 
                            delay: i * 0.1,
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          ✨
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

interface SmartRecommendationProps {
  recommendation: string;
  className?: string;
}

export function SmartRecommendation({ recommendation, className = '' }: SmartRecommendationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springPresets.gentle}
      className={`flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 ${className}`}
    >
      <div className="p-2 rounded-full bg-gradient-to-br from-primary to-accent shadow-sm">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-foreground mb-1">
          AI 學習建議
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {recommendation}
        </p>
      </div>
    </motion.div>
  );
}