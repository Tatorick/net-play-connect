import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Player {
  id: string;
  full_name: string;
  document_id: string;
  birthdate: string;
  position: string;
  jersey_number: number;
  contact_email?: string;
  guardian_contact?: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  teams?: { name: string };
}

interface PlayersTableProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
}

export function PlayersTable({ players, onEdit, onDelete }: PlayersTableProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No players found. Register your first player to get started.
      </div>
    );
  }

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'Setter': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Libero': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Middle Blocker': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Outside Hitter': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Opposite': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[position] || colors['Other'];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Jersey #</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.full_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  #{player.jersey_number}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPositionColor(player.position)}>
                  {player.position}
                </Badge>
              </TableCell>
              <TableCell>{calculateAge(player.birthdate)} years</TableCell>
              <TableCell>{player.teams?.name || 'Unknown'}</TableCell>
              <TableCell>
                {player.contact_email ? (
                  <a 
                    href={`mailto:${player.contact_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {player.contact_email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">No email</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(player)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove
                          "{player.full_name}" from the team.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(player.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Player
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}