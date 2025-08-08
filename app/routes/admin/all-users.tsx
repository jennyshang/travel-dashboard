import { users } from '~/constants';
import { Header } from '../../../components'
import { GridComponent } from '@syncfusion/ej2-react-grids';
import { Column, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-charts';
import { cn, formatDate, formatKey } from '~/lib/utils';
import { getAllUsers } from '~/appwrite/auth';
import type {Route} from './+types/all-users';

export const loader = async () => {
  const { users, total } = await getAllUsers(10, 0);
  return { users, total }
}

const AllUsers = ({loaderData} : Route.ComponentProps) => {
  const { users } = loaderData;
  return (
    <main className="all-users wrapper">
      <Header
        title="Manage Users"
        description="Filter, sort, and access detailed user profiles."
      />

      <GridComponent dataSource={users} gridLines="None">
        <ColumnsDirective>
          <ColumnDirective
            field="name"
            headerText="Name"
            textAlign="Left"
            width="200"
            template={(props: UserData) => (
              <div className="flex items-center gap-1.5 px-4">
                <img src={props.imageUrl} alt="user" className="size-8 rounded-full aspect-square" referrerPolicy='no-referrer'/>
                <span>{props.name}</span>
              </div>
            )}
          />
          <ColumnDirective
            field="email"
            headerText="Email"
            textAlign="Left"
            width="200"
          />
          <ColumnDirective
            field="joinedAt"
            headerText="Date Joined"
            textAlign="Left"
            width="120"
            template={({ joinedAt }: {joinedAt: string}) => formatDate(joinedAt)}
          />
          {/* <ColumnDirective
            field="itineraryCreated"
            headerText="Trip Created"
            textAlign="Left"
            width="130"
          /> */}
          <ColumnDirective
            field="status"
            headerText="Type"
            textAlign="Left"
            width="100"
            template={({ status }: UserData) => (
              <article className={cn('status-column', status === 'user' ? 'bg-success-50' : 'bg-light-300')}>
                <div className={cn('size-1.5 rounded full', status === 'user' ? 'bg-success-500' : 'bg-gray-500')}>
                </div>

                <h3 className={cn('font-inter text-xs font-medium', status === 'user' ? 'text-success-700' : 'text-gray-500')}>{status}</h3>

              </article>
            )}
          />
        </ColumnsDirective>

      </GridComponent>
    </main>
  )
}

export default AllUsers