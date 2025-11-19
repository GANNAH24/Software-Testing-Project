import { useState } from 'react';
import { Calendar, Clock, Plus, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

// Converted from TSX: removed ManageScheduleProps interface and type annotations
export function ManageSchedule({ navigate, user }) {
  const WEEKLY = [
    { day: 'Monday', date: '2025-11-10', slots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'], available: true },
    { day: 'Tuesday', date: '2025-11-11', slots: ['09:00-10:00', '11:00-12:00', '14:00-15:00'], available: true },
    { day: 'Wednesday', date: '2025-11-12', slots: ['10:00-11:00', '11:00-12:00', '15:00-16:00', '16:00-17:00'], available: true },
    { day: 'Thursday', date: '2025-11-13', slots: ['09:00-10:00', '10:00-11:00', '11:00-12:00'], available: false },
    { day: 'Friday', date: '2025-11-14', slots: ['14:00-15:00', '15:00-16:00', '16:00-17:00'], available: true }
  ];

  const [selectedTab, setSelectedTab] = useState('weekly');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [blockTimeDialogOpen, setBlockTimeDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotsInput, setSlotsInput] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockSlot, setBlockSlot] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const handleCreateSchedule = () => {
    if (!selectedDate || !slotsInput) { toast.error('Please fill in all fields'); return; }
    toast.success('Schedule created successfully!');
    setCreateDialogOpen(false); setSlotsInput('');
  };

  const handleBlockTime = () => {
    if (!blockDate || !blockSlot) { toast.error('Please select date and time slot'); return; }
    toast.success('Time slot blocked successfully!');
    setBlockTimeDialogOpen(false); setBlockDate(''); setBlockSlot(''); setBlockReason('');
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-gray-900 mb-2">Manage Schedule</h1><p className="text-gray-600">Set your availability and manage time slots</p></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBlockTimeDialogOpen(true)}><Lock className="w-4 h-4 mr-2" />Block Time</Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#667eea] hover:bg-[#5568d3]"><Plus className="w-4 h-4 mr-2" />Create Schedule</Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6"><TabsTrigger value="weekly">Weekly View</TabsTrigger><TabsTrigger value="daily">Daily View</TabsTrigger></TabsList>
          <TabsContent value="weekly"><div className="space-y-4">
            {WEEKLY.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar className="w-8 h-8 text-gray-400" /></div><h3 className="text-gray-900 mb-2">No Schedule Created</h3><p className="text-gray-600 mb-6">Create your first schedule to start accepting appointments</p><Button onClick={() => setCreateDialogOpen(true)} className="bg-[#667eea] hover:bg-[#5568d3]">Create Schedule</Button></CardContent></Card>
            ) : WEEKLY.map((day, i) => (
              <Card key={i}><CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div><h3 className="text-gray-900 mb-1">{day.day}</h3><p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</p></div>
                  <div className="flex items-center gap-2"><span className={`px-3 py-1 rounded-full text-xs ${day.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{day.available ? 'Available' : 'Unavailable'}</span><Button size="sm" variant="outline">Edit</Button></div>
                </div>
                <div className="flex flex-wrap gap-2">{day.slots.map((slot, si) => (
                  <div key={si} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"><Clock className="w-4 h-4 text-blue-600" /><span className="text-sm text-blue-900">{slot}</span></div>
                ))}</div>
                {day.slots.length === 0 && (<p className="text-sm text-gray-500">No slots available</p>)}
              </CardContent></Card>
            ))}
          </div></TabsContent>
          <TabsContent value="daily"><Card className="mb-6"><CardContent className="p-6"><Label>Select Date</Label><Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-2 max-w-xs" /></CardContent></Card>
            <Card><CardContent className="p-6"><h3 className="text-gray-900 mb-4">Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3><div className="space-y-2">{['09:00-10:00','10:00-11:00','11:00-12:00','14:00-15:00','15:00-16:00','16:00-17:00'].map((slot,i)=>(
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><span className="text-gray-900">{slot}</span></div>
                <div className="flex gap-2"><span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">Available</span><Button size="sm" variant="outline">Block</Button></div>
              </div>
            ))}</div></CardContent></Card></TabsContent>
        </Tabs>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}><DialogContent><DialogHeader><DialogTitle>Create Schedule</DialogTitle><DialogDescription>Set up your availability for a specific date</DialogDescription></DialogHeader><div className="space-y-4">
          <div><Label htmlFor="scheduleDate">Date</Label><Input id="scheduleDate" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-2" /></div>
          <div><Label htmlFor="slots">Time Slots (one per line)</Label><Textarea id="slots" value={slotsInput} onChange={(e) => setSlotsInput(e.target.value)} placeholder={"09:00-10:00\n10:00-11:00\n14:00-15:00"} rows={5} className="mt-2 font-mono text-sm" /><p className="text-sm text-gray-500 mt-1">Enter time slots in format: HH:MM-HH:MM</p></div>
        </div><DialogFooter><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateSchedule} className="bg-[#667eea] hover:bg-[#5568d3]">Create Schedule</Button></DialogFooter></DialogContent></Dialog>

        <Dialog open={blockTimeDialogOpen} onOpenChange={setBlockTimeDialogOpen}><DialogContent><DialogHeader><DialogTitle>Block Time Slot</DialogTitle><DialogDescription>Mark a time slot as unavailable</DialogDescription></DialogHeader><div className="space-y-4">
          <div><Label htmlFor="blockDate">Date</Label><Input id="blockDate" type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-2" /></div>
          <div><Label htmlFor="blockSlot">Time Slot</Label><Input id="blockSlot" type="text" value={blockSlot} onChange={(e) => setBlockSlot(e.target.value)} placeholder="09:00-10:00" className="mt-2" /></div>
          <div><Label htmlFor="blockReason">Reason (Optional)</Label><Textarea id="blockReason" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="e.g., Personal appointment" rows={3} className="mt-2" /></div>
        </div><DialogFooter><Button variant="outline" onClick={() => setBlockTimeDialogOpen(false)}>Cancel</Button><Button onClick={handleBlockTime} className="bg-[#667eea] hover:bg-[#5568d3]">Block Time</Button></DialogFooter></DialogContent></Dialog>
      </div>
    </div>
  );
}
