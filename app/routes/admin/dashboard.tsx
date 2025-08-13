import { getAllUsers, getUser } from '~/appwrite/auth';
import { Header, StatsCard, TripCard, SearchBar } from '../../../components';
import React, { useMemo, useState } from 'react';
import type { Route } from './+types/dashboard'
import { getTripsByTravelStyle, getTripsCreatedPerDay, getUserGrowthPerDay, getUsersAndTripsStats, getActiveUserGrowthPerDay } from '~/appwrite/dashboard';
import { getAllTrips } from '~/appwrite/trips';
import { parseTripData } from '~/lib/utils';
import { Category, ChartComponent, ColumnDirective, ColumnsDirective, ColumnSeries, DataLabel, Inject, SeriesCollectionDirective, SeriesDirective, SplineAreaSeries, Tooltip } from '@syncfusion/ej2-react-charts';
import { tripXAxis, tripyAxis, userXAxis, useryAxis } from '~/constants';
import { GridComponent } from '@syncfusion/ej2-react-grids';


export const clientLoader = async () => {
    const [
        user,
        dashboardStats,
        trips,
        userGrowth,
        tripsByTravelStyle,
        allUsers,
        tripsGrowth,
        activeUserGrowth
    ] = await Promise.all([
        getUser(),
        getUsersAndTripsStats(),
        getAllTrips(4, 0),
        getUserGrowthPerDay(),
        getTripsByTravelStyle(),
        getAllUsers(4, 0),
        getTripsCreatedPerDay(),
        getActiveUserGrowthPerDay()
    ]);

    // Format sparkline data
    const userGrowthData = userGrowth.map((d) => ({ x: d.day, y: d.count }));
    const tripsGrowthData = tripsGrowth.map((d) => ({ x: d.day, y: d.count }));

    return {
        user,
        dashboardStats,
        allTrips: trips.allTrips.map(({ $id, tripDetail, imageUrls }) => ({
            id: $id,
            ...parseTripData(tripDetail),
            imageUrls: imageUrls ?? []
        })),
        userGrowth,
        tripsByTravelStyle,
        allUsers: allUsers.users.map((user) => ({
            imageUrl: user.imageUrl,
            name: user.name,
            count: user.itineraryCount ?? Math.floor(Math.random() * 10),
        })),
        userGrowthData: userGrowth.map((d) => ({ x: d.day, y: d.count })),
        tripsGrowthData: tripsGrowth.map((d) => ({ x: d.day, y: d.count })),
        activeUserGrowthData: activeUserGrowth.map((d) => ({ x: d.day, y: d.count }))
    };
}



const Dashboard = ({ loaderData }: Route.ComponentProps) => {

    const user = loaderData.user as User | null;
    const { dashboardStats, allTrips, userGrowth, tripsByTravelStyle, allUsers } = loaderData;

    const trips = allTrips.map((trip) => ({
        id: trip.id,
        imageUrl: trip.imageUrls[0],
        name: trip.name,
        interest: trip.interests,
        travelStyle: trip.travelStyle,
        estimatedPrice: trip.estimatedPrice,
        itinerary: trip.itinerary,
        duration: trip.duration ?? null,
        groupType: (trip.groupType as string) ?? '',
    }));

    // Quick search state (admin)
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredTrips = useMemo(() => {
        const q = (searchQuery || '').trim().toLowerCase();
        if (!q) return trips;

        return trips.filter((t) => {
            // Safely build a single searchable string from the trip object
            const itineraryLocations = Array.isArray(t.itinerary)
                ? t.itinerary.map((it: any) => (it.location ?? it.country ?? '')).join(' ')
                : '';

            const fields = [
                String(t.name ?? ''),
                String(t.interest ?? ''),
                String(t.travelStyle ?? ''),
                String(t.estimatedPrice ?? ''),
                String(t.duration ?? ''),
                String(t.groupType ?? ''),
                itineraryLocations,
            ].join(' ').toLowerCase();

            return fields.indexOf(q) !== -1;
        });
    }, [trips, searchQuery]);

    const usersAndTrips = [
        {
            title: 'Latest user signups',
            dataSource: allUsers,
            field: 'count',
            headerText: 'Trips created'
        },
        {
            title: 'Trips based on interests',
            dataSource: trips,
            field: 'interest',
            headerText: 'Interests'
        }
    ]

    return (
        <main className="dashboard wrapper">
            <Header
                title={`Welcome ${user?.name ?? 'Guest'} ✌️`}
                description="Track activity, trends, and popular destinations in real time."
            />

            <section className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatsCard
                        headerTitle="Total Users"
                        total={dashboardStats.totalUsers}
                        currentMonthCount={dashboardStats.usersJoined.currentMonth}
                        lastMonthCount={dashboardStats.usersJoined.lastMonth}
                        trendData={loaderData.userGrowthData}
                    />
                    <StatsCard
                        headerTitle="Total Trips"
                        total={dashboardStats.totalTrips}
                        currentMonthCount={dashboardStats.tripsCreated.currentMonth}
                        lastMonthCount={dashboardStats.tripsCreated.lastMonth}
                        trendData={loaderData.tripsGrowthData}
                    />
                    <StatsCard
                        headerTitle="Active Users"
        total={dashboardStats.userRole.total}
        currentMonthCount={dashboardStats.userRole.currentMonth}
        lastMonthCount={dashboardStats.userRole.lastMonth}
        trendData={loaderData.activeUserGrowthData}
                    />
                </div>
            </section>

        <section className="container">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-dark-100">Created Trips</h1>
                    <div className="w-80">
                        <SearchBar
                            value={searchQuery}
                            onChange={(v) => setSearchQuery(v)}
                            placeholder="Search trips by name, country, price, duration, interests, group..."
                        />
                    </div>
                </div>

                <div className="trip-grid">
                    {filteredTrips.length > 0 ? (
                        filteredTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                id={trip.id.toString()}
                                name={trip.name!}
                                imageUrl={trip.imageUrl}
                                location={trip.itinerary?.[0]?.location ?? ''}
                                tags={[trip.interest ?? '', trip.travelStyle ?? '']}
                                price={trip.estimatedPrice!}
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center w-full col-span-full">
                            <p className="text-sm text-gray-300">No search results found — try a different query.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartComponent
                    id="chart-1"
                    primaryXAxis={userXAxis}
                    primaryYAxis={useryAxis}
                    title="User Growth"
                    tooltip={{ enable: true }}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="Column"
                            name="Column"
                            columnWidth={0.3}
                            cornerRadius={{ topLeft: 10, topRight: 10 }}
                        />

                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="SplineArea"
                            name="Wave"
                            fill="rgba(71, 132, 238, 0.3)"
                            border={{ width: 2, color: '#4784EE' }}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>

                <ChartComponent
                    id="chart-2"
                    primaryXAxis={tripXAxis}
                    primaryYAxis={tripyAxis}
                    title="Trip Trends"
                    tooltip={{ enable: true }}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={tripsByTravelStyle}
                            xName="travelStyle"
                            yName="count"
                            type="Column"
                            name="day"
                            columnWidth={0.3}
                            cornerRadius={{ topLeft: 10, topRight: 10 }}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
            </section>

            <section className="user-trip wrapper">
                {usersAndTrips.map(({ title, dataSource, field, headerText }, i) => (
                    <div key={i} className="flex flex-col gap-5">
                        <h3 className="p-20-semibold text-dark-100">{title}</h3>

                        <GridComponent dataSource={dataSource} gridLines="None">
                            <ColumnsDirective>
                                <ColumnDirective
                                    field="name"
                                    headerText="Name"
                                    width="200"
                                    textAlign="Left"
                                    template={(props: UserData) => (
                                        <div className="flex items-center gap-1.5 px-4">
                                            <img src={props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                            <span>{props.name}</span>
                                        </div>
                                    )}
                                />

                                <ColumnDirective
                                    field={field}
                                    headerText={headerText}
                                    width="150"
                                    textAlign="Left"
                                />
                            </ColumnsDirective>
                        </GridComponent>
                    </div>
                ))}
            </section>


        </main>
    )
}

export default Dashboard