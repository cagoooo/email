import React from 'react';
import { Layout } from '@/components/Layout';
import { useGameProgress } from '@/hooks/useGameProgress';
import { SHOP_ITEMS } from '@/data/index';
import { ShopItem } from '@/lib/index';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, ShoppingBag, Check, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Shop = () => {
    const { progress, purchaseItem, updateCustomization } = useGameProgress();
    const userCoins = progress?.coins || 0;
    const ownedItems = progress?.ownedItems || [];

    const handlePurchase = (item: ShopItem) => {
        if (userCoins < item.price) {
            toast.error('代幣不足，快去挑戰關卡賺取吧！');
            return;
        }

        const success = purchaseItem(item);
        if (success) {
            toast.success(`成功兌換 ${item.title}！`);
        }
    };

    const handleEquip = (item: ShopItem) => {
        if (item.category === 'avatarFrame') {
            updateCustomization({ avatarFrame: item.value });
        } else if (item.category === 'nameColor') {
            updateCustomization({ nameColor: item.value });
        } else if (item.category === 'theme') {
            updateCustomization({ theme: item.value });
        } else if (item.category === 'cursor') {
            updateCustomization({ cursor: item.value });
        }
        toast.success(`已裝備 ${item.title}`);
    };

    const isEquipped = (item: ShopItem) => {
        if (item.category === 'avatarFrame') {
            return progress?.customization?.avatarFrame === item.value;
        }
        if (item.category === 'nameColor') {
            return progress?.customization?.nameColor === item.value;
        }
        if (item.category === 'theme') {
            return progress?.customization?.theme === item.value;
        }
        if (item.category === 'cursor') {
            return progress?.customization?.cursor === item.value;
        }
        return false;
    };

    const isOwned = (item: ShopItem) => {
        return ownedItems.includes(item.id);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-primary" />
                            霓虹商城
                        </h1>
                        <p className="text-muted-foreground font-medium">使用代幣兌換專屬外觀，展現你的獨特風格！</p>
                    </div>

                    <Card className="flex items-center gap-3 px-6 py-4 bg-primary/5 border-primary/20 shadow-lg shadow-primary/5">
                        <div className="p-3 bg-amber-500/10 rounded-full">
                            <Coins className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">目前持有代幣</p>
                            <p className="text-2xl font-black text-primary">{userCoins}</p>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SHOP_ITEMS.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-colors">
                                <div className="h-40 bg-muted/30 flex items-center justify-center p-6 relative">
                                    {/* 預覽區域 */}
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center border-4 border-muted">
                                            <User className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                        {item.category === 'avatarFrame' && (
                                            <div className={`absolute inset-0 -m-1 rounded-full border-4 ${item.preview}`} />
                                        )}
                                        {item.category === 'nameColor' && (
                                            <div
                                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-background text-[10px] font-bold shadow-sm whitespace-nowrap"
                                                style={{ color: item.value }}
                                            >
                                                樣式預覽
                                            </div>
                                        )}
                                        {item.category === 'theme' && (
                                            <div className={`absolute inset-0 -m-8 rounded-lg blur-[2px] opacity-50 ${item.preview}`} />
                                        )}
                                        {item.category === 'cursor' && (
                                            <div className="absolute -top-4 -right-4 text-2xl animate-bounce">
                                                {item.preview}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <div className="flex items-center gap-1 text-amber-600 font-black">
                                            <Coins className="w-4 h-4" />
                                            {item.price}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{item.description}</p>

                                    <div className="mt-auto">
                                        {isEquipped(item) ? (
                                            <Button className="w-full bg-green-500 hover:bg-green-600 cursor-default" variant="secondary">
                                                <Check className="w-4 h-4 mr-2" />
                                                已裝備
                                            </Button>
                                        ) : isOwned(item) ? (
                                            <Button
                                                className="w-full border-primary text-primary hover:bg-primary/5 font-bold"
                                                variant="outline"
                                                onClick={() => handleEquip(item)}
                                            >
                                                裝備
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                                                onClick={() => handlePurchase(item)}
                                            >
                                                兌換 {item.title}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Shop;
