import React from 'react'
import { calculateTrendPercentage, cn } from '~/lib/utils'
import {
    ChartComponent,
    SeriesCollectionDirective,
    SeriesDirective,
    Inject,
    SplineAreaSeries,
    Category,
} from '@syncfusion/ej2-react-charts';

interface StatsCardProps extends StatsCard {
    trendData?: { x: string; y: number }[]; // small dataset for sparkline
}

const StatsCard = ({
    headerTitle,
    total,
    currentMonthCount,
    lastMonthCount,
    trendData = [] }: StatsCardProps
) => {
    const { trend, percentage } = calculateTrendPercentage(currentMonthCount, lastMonthCount);
    const isDecrement = trend === 'decrement';

    const fillColor = isDecrement ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'; // red/green with transparency
    const borderColor = isDecrement ? '#EF4444' : '#22C55E'; // solid red/green

    return (
        <article className="stats-card">
            <h3 className="text-base font-medium">
                {headerTitle}
            </h3>

            <div className="content">
                <div className="flex flex-col gap-4">
                    <h2 className="text-4xl font-semibold">{total}</h2>

                    <div className="flex items-center gap-2">
                        <figure className="flex items-center gap-1">
                            <img src={`/assets/icons/${isDecrement ? 'arrow-down-red.svg' : 'arrow-up-green.svg'}`} className="size-5" alt="arrow" />
                            <figcaption className={cn('text-sm font-medium', isDecrement ? 'text-red-500' : 'text-success-700')}>
                                {Math.round(percentage)}%
                            </figcaption>
                        </figure>
                        <p className="text-sm font-medium text-gray-100 truncate">vs last month</p>
                    </div>
                </div>

                {trendData.length > 0 ? (
                    <ChartComponent
                        id={`spark-${headerTitle}`}
                        height="80px"
                        width="150px"
                        primaryXAxis={{
                            valueType: 'Category',
                            visible: false,
                            majorGridLines: { width: 0 },
                        }}
                        primaryYAxis={{
                            visible: false,
                            majorGridLines: { width: 0 },
                            lineStyle: { width: 0 },
                            labelStyle: { size: '0px' },
                        }}
                        chartArea={{ border: { width: 0 } }}
                        tooltip={{ enable: false }}
                        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    >
                        <Inject services={[SplineAreaSeries, Category]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective
                                dataSource={trendData}
                                xName="x"
                                yName="y"
                                type="SplineArea"
                                fill={fillColor}
                                opacity={0.4}
                                border={{ width: 2, color: borderColor }}
                            />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                ) : (
                    <img
                        src={`/assets/icons/${isDecrement ? 'decrement.svg' : 'increment.svg'}`}
                        className="xl:w-32 w-full h-full md:h-32 xl:h-full"
                        alt="trend graph"
                    />
                )}


            </div>
        </article>
    );
}

export default StatsCard