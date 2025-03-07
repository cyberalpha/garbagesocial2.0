
import { User } from '@/types';
import UserCard from './UserCard';
import ActionTabs from './ActionTabs';

interface DetailSidebarProps {
  publisher: User | null;
  recycler: User | null;
}

const DetailSidebar = ({ publisher, recycler }: DetailSidebarProps) => {
  return (
    <div className="space-y-6">
      {publisher && (
        <UserCard user={publisher} title="Publicador" />
      )}
      
      {recycler && (
        <UserCard user={recycler} title="Reciclador" />
      )}
      
      <ActionTabs />
    </div>
  );
};

export default DetailSidebar;
