import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, TrendingDown, Target, DollarSign, Users, Percent } from "lucide-react";
import { Metrics, Competitor } from "@/hooks/useProject";
import { calculateProfit, calculateProfitMargin, calculateCAC, calculateLTV, calculateLTVCACRatio } from "@/utils/metricsCalculations";

interface CompetitiveRankingProps {
  myCompany: Metrics;
  competitors: Competitor[];
  currency: string;
}

interface RankingMetric {
  name: string;
  icon: React.ReactNode;
  getValue: (company: any) => number;
  format: (value: number) => string;
  higherIsBetter: boolean;
}

export const CompetitiveRanking = ({ myCompany, competitors, currency }: CompetitiveRankingProps) => {
  const metrics: RankingMetric[] = [
    {
      name: 'Выручка',
      icon: <DollarSign className="h-4 w-4" />,
      getValue: (c) => c.revenue || 0,
      format: (v) => `${v.toLocaleString()} ${currency}`,
      higherIsBetter: true,
    },
    {
      name: 'Прибыль',
      icon: <TrendingUp className="h-4 w-4" />,
      getValue: (c) => {
        if (c.detailedExpenses) {
          return calculateProfit(c);
        }
        return 0;
      },
      format: (v) => `${v.toLocaleString()} ${currency}`,
      higherIsBetter: true,
    },
    {
      name: 'Маржа',
      icon: <Percent className="h-4 w-4" />,
      getValue: (c) => {
        if (c.detailedExpenses) {
          return calculateProfitMargin(c);
        }
        return 0;
      },
      format: (v) => `${v.toFixed(1)}%`,
      higherIsBetter: true,
    },
    {
      name: 'CAC',
      icon: <Target className="h-4 w-4" />,
      getValue: (c) => {
        if (c.detailedExpenses && c.newClients && c.newClients > 0) {
          return calculateCAC(c);
        }
        return 0;
      },
      format: (v) => `${v.toLocaleString()} ${currency}`,
      higherIsBetter: false,
    },
    {
      name: 'LTV',
      icon: <DollarSign className="h-4 w-4" />,
      getValue: (c) => {
        if (c.customerLifetimeMonths && c.purchaseFrequency && c.avgCheck) {
          return calculateLTV(c);
        }
        return 0;
      },
      format: (v) => `${v.toLocaleString()} ${currency}`,
      higherIsBetter: true,
    },
    {
      name: 'LTV/CAC',
      icon: <TrendingUp className="h-4 w-4" />,
      getValue: (c) => {
        if (c.detailedExpenses && c.newClients && c.newClients > 0 && c.customerLifetimeMonths && c.purchaseFrequency && c.avgCheck) {
          return calculateLTVCACRatio(c);
        }
        return 0;
      },
      format: (v) => `${v.toFixed(1)}x`,
      higherIsBetter: true,
    },
    {
      name: 'Доля рынка',
      icon: <Users className="h-4 w-4" />,
      getValue: (c) => c.marketShare || 0,
      format: (v) => `${v.toFixed(1)}%`,
      higherIsBetter: true,
    },
    {
      name: 'Качество',
      icon: <Trophy className="h-4 w-4" />,
      getValue: (c) => c.quality || 0,
      format: (v) => `${v.toFixed(0)}/100`,
      higherIsBetter: true,
    },
  ];

  // Add my company to the list
  const allCompanies = [
    { ...myCompany, name: 'Моя компания', isMe: true },
    ...competitors.map(c => ({ ...c, isMe: false })),
  ];

  // Calculate rankings for each metric
  const rankings = metrics.map(metric => {
    const values = allCompanies.map(company => ({
      company,
      value: metric.getValue(company),
    }));

    // Sort by value (higher or lower depending on metric)
    values.sort((a, b) => 
      metric.higherIsBetter 
        ? b.value - a.value 
        : a.value - b.value
    );

    // Assign ranks
    const ranked = values.map((v, index) => ({
      ...v,
      rank: index + 1,
    }));

    return {
      metric,
      ranked,
    };
  });

  // Calculate overall score
  const overallScores = allCompanies.map(company => {
    let totalScore = 0;
    let metricsWithData = 0;

    rankings.forEach(({ metric, ranked }) => {
      const companyRank = ranked.find(r => r.company.name === company.name);
      if (companyRank && companyRank.value > 0) {
        // Score: 1st place = 100, last place = 0, linearly interpolated
        const maxRank = ranked.filter(r => r.value > 0).length;
        const score = ((maxRank - companyRank.rank + 1) / maxRank) * 100;
        totalScore += score;
        metricsWithData++;
      }
    });

    return {
      company,
      score: metricsWithData > 0 ? totalScore / metricsWithData : 0,
    };
  });

  overallScores.sort((a, b) => b.score - a.score);
  const myOverallRank = overallScores.findIndex(s => s.company.isMe) + 1;
  const myOverallScore = overallScores.find(s => s.company.isMe)?.score || 0;

  const getRankBadge = (rank: number, total: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🥇 {rank}</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">🥈 {rank}</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">🥉 {rank}</Badge>;
    return <Badge variant="outline">{rank}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Overall Ranking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Общий рейтинг конкурентоспособности
          </CardTitle>
          <CardDescription>
            Ваша позиция среди {allCompanies.length} компаний на рынке
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ваша позиция</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getRankBadge(myOverallRank, allCompanies.length)}
                  <span className="text-muted-foreground text-sm">из {allCompanies.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Общий балл</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{myOverallScore.toFixed(0)}/100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Статус</CardTitle>
              </CardHeader>
              <CardContent>
                {myOverallRank === 1 && (
                  <Badge className="bg-green-500">Лидер рынка</Badge>
                )}
                {myOverallRank === 2 && (
                  <Badge className="bg-blue-500">Сильный игрок</Badge>
                )}
                {myOverallRank === 3 && (
                  <Badge className="bg-orange-500">Претендент</Badge>
                )}
                {myOverallRank > 3 && myOverallRank <= Math.ceil(allCompanies.length / 2) && (
                  <Badge variant="secondary">Середняк</Badge>
                )}
                {myOverallRank > Math.ceil(allCompanies.length / 2) && (
                  <Badge variant="destructive">Аутсайдер</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Рейтинг компаний</h4>
            {overallScores.map((item, index) => (
              <div 
                key={item.company.name}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  item.company.isMe ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 min-w-[60px]">
                  {getRankBadge(index + 1, allCompanies.length)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${item.company.isMe ? 'text-primary' : ''}`}>
                      {item.company.name}
                    </span>
                    <span className="text-sm font-semibold">
                      {item.score.toFixed(0)}/100
                    </span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Детальные рейтинги по метрикам</CardTitle>
          <CardDescription>
            Сравнение по ключевым показателям эффективности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Метрика</th>
                  {allCompanies.map((company, idx) => (
                    <th 
                      key={idx} 
                      className={`text-center p-3 font-semibold ${company.isMe ? 'text-primary' : ''}`}
                    >
                      {company.isMe ? '🏢 Вы' : company.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {ranking.metric.icon}
                        <span className="font-medium">{ranking.metric.name}</span>
                      </div>
                    </td>
                    {allCompanies.map((company, companyIdx) => {
                      const companyRank = ranking.ranked.find(r => r.company.name === company.name);
                      const value = companyRank?.value || 0;
                      const rank = companyRank?.rank || '-';
                      
                      if (value === 0) {
                        return (
                          <td key={companyIdx} className="text-center p-3 text-muted-foreground">
                            -
                          </td>
                        );
                      }

                      const isMyCompany = company.isMe;
                      const isBest = rank === 1;
                      
                      return (
                        <td 
                          key={companyIdx} 
                          className={`text-center p-3 ${
                            isMyCompany ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              {isBest && <Trophy className="h-3 w-3 text-yellow-500" />}
                              <span className={`text-sm font-semibold ${isBest ? 'text-green-500' : ''}`}>
                                {ranking.metric.format(value)}
                              </span>
                            </div>
                            <Badge 
                              variant={isBest ? 'default' : 'outline'} 
                              className="text-xs"
                            >
                              #{rank}
                            </Badge>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Стратегические выводы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rankings.map((ranking, idx) => {
            const myRank = ranking.ranked.find(r => r.company.isMe);
            if (!myRank || myRank.value === 0) return null;
            
            const isLeader = myRank.rank === 1;
            const isLaggard = myRank.rank === ranking.ranked.filter(r => r.value > 0).length;
            
            if (isLeader) {
              return (
                <div key={idx} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-500">{ranking.metric.name}: Лидерство</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Вы лидируете по показателю {ranking.metric.name} ({ranking.metric.format(myRank.value)}). 
                        Поддерживайте преимущество и используйте его как конкурентное преимущество.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (isLaggard) {
              return (
                <div key={idx} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive">{ranking.metric.name}: Отставание</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ваш показатель {ranking.metric.name} ({ranking.metric.format(myRank.value)}) отстаёт от конкурентов. 
                        Это критическая область для улучшения.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            return null;
          }).filter(Boolean)}
        </CardContent>
      </Card>
    </div>
  );
};
