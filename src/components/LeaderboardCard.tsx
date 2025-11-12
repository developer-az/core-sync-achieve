import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  rank: number;
  username: string;
  avatarUrl?: string;
  value: number;
  unit: string;
  isCurrentUser: boolean;
}

export const LeaderboardCard = ({ 
  rank, 
  username, 
  avatarUrl, 
  value, 
  unit,
  isCurrentUser 
}: LeaderboardCardProps) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card 
      className={cn(
        'border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.02]',
        isCurrentUser && 'ring-2 ring-cyan shadow-lg bg-gradient-to-r from-cyan/5 to-purple/5'
      )}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 text-center">
          {rank <= 3 ? (
            getRankIcon()
          ) : (
            <Badge className={cn('w-10 h-10 flex items-center justify-center text-lg font-bold', getRankBadgeColor())}>
              {rank}
            </Badge>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="bg-gradient-to-br from-cyan to-purple text-white font-bold">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-semibold truncate',
              isCurrentUser ? 'text-cyan' : 'text-foreground'
            )}>
              {username}
            </p>
            {isCurrentUser && (
              <Badge className="bg-gradient-to-r from-cyan to-purple text-white text-xs">
                You
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {value.toLocaleString()} {unit}
          </p>
        </div>

        {/* Top 3 Badge */}
        {rank <= 3 && (
          <div className="flex-shrink-0">
            <Badge className={cn('font-bold', getRankBadgeColor())}>
              Top {rank}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};