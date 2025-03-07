
import { Clock, User as UserIcon } from 'lucide-react';
import { PickupCommitment, User } from '@/types';

interface PickupCommitmentInfoProps {
  commitment: PickupCommitment;
  recycler: User | null;
  formatDate: (date: Date) => string;
}

const PickupCommitmentInfo = ({ commitment, recycler, formatDate }: PickupCommitmentInfoProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-md">
      <h4 className="font-medium text-blue-800 mb-2">Compromiso de Retiro</h4>
      <div className="text-sm space-y-2">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-blue-600 mr-2" />
          <span>Fecha: {formatDate(commitment.commitmentDate)}</span>
        </div>
        
        {recycler && (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-blue-600 mr-2" />
            <span>Reciclador: {recycler.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupCommitmentInfo;
