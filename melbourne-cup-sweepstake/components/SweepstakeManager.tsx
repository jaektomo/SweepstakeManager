"use client";

import React, { useState, KeyboardEvent, ChangeEvent, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ShuffleIcon, Trophy, ChevronLeft, Search, UserPlus } from 'lucide-react';

interface PrizeDistribution {
  place: number;
  percentage: number;
}

interface Assignment {
  participant: string;
  horse: string;
}

interface Winner extends Assignment {
  place: number;
  winnings: number;
}

interface Sweepstake {
  id: string;
  name: string;
  buyIn: number;
  prizeDistribution: PrizeDistribution[];
  status: 'setup' | 'active' | 'completed';
  participants: string[];
  assignments: Assignment[];
  winners: Winner[];
  createdAt: string;
}

const SweepstakeManager: React.FC = () => {
  // Main application state
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [sweepstakes, setSweepstakes] = useState<Sweepstake[]>([]);
  const [activeSweepstake, setActiveSweepstake] = useState<Sweepstake | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const participantInputRef = useRef<HTMLInputElement>(null);
  
  // New sweepstake form state
  const [newSweepstake, setNewSweepstake] = useState<Omit<Sweepstake, 'id' | 'status' | 'participants' | 'assignments' | 'winners' | 'createdAt'>>({
    name: '',
    buyIn: 0,
    prizeDistribution: [{ place: 1, percentage: 60 }]
  });

  // Sample horses
  const sampleHorses = [
    "Gold Trip", "Deauville Legend", "Montefilia", "Breakup", 
    "Vow And Declare", "Without A Fight", "Soulcombe", "Right You Are",
    "Cleveland", "Ashrun", "Future History", "More Felons"
  ];

  // Create new sweepstake
  const createSweepstake = () => {
    if (!newSweepstake.name || newSweepstake.buyIn <= 0) return;
    
    const id = Date.now().toString();
    const newSweepstakeEntry: Sweepstake = {
      id,
      ...newSweepstake,
      status: 'setup',
      participants: [],
      assignments: [],
      winners: [],
      createdAt: new Date().toISOString()
    };
    setSweepstakes([...sweepstakes, newSweepstakeEntry]);
    setView('list');
    resetNewSweepstakeForm();
  };

  const resetNewSweepstakeForm = () => {
    setNewSweepstake({
      name: '',
      buyIn: 0,
      prizeDistribution: [{ place: 1, percentage: 60 }]
    });
  };

  // Participant management
  const addParticipant = (sweepstakeId: string, name: string) => {
    setSweepstakes(sweepstakes.map(sweep => 
      sweep.id === sweepstakeId
        ? { ...sweep, participants: [...sweep.participants, name] }
        : sweep
    ));
  };

  const handleAddParticipant = (sweepstakeId: string) => {
    if (participantInputRef.current && participantInputRef.current.value) {
      addParticipant(sweepstakeId, participantInputRef.current.value);
      participantInputRef.current.value = '';
      participantInputRef.current.focus();
    }
  };

  // Horse assignment
  const assignHorses = (sweepstakeId: string) => {
    const sweep = sweepstakes.find(s => s.id === sweepstakeId);
    if (!sweep) return;

    const shuffledHorses = [...sampleHorses]
      .sort(() => Math.random() - 0.5)
      .slice(0, sweep.participants.length);
    
    const assignments = sweep.participants.map((participant, index) => ({
      participant,
      horse: shuffledHorses[index]
    }));

    setSweepstakes(sweepstakes.map(s => 
      s.id === sweepstakeId
        ? { ...s, assignments, status: 'active' as const }
        : s
    ));
  };

  // Complete race
  const completeRace = (sweepstakeId: string) => {
    const sweep = sweepstakes.find(s => s.id === sweepstakeId);
    if (!sweep) return;

    const raceResults = sweep.assignments
      .sort(() => Math.random() - 0.5)
      .slice(0, sweep.prizeDistribution.length)
      .map((assignment, index) => ({
        ...assignment,
        place: index + 1,
        winnings: (sweep.buyIn * sweep.participants.length * 
                  sweep.prizeDistribution[index].percentage) / 100
      }));

    setSweepstakes(sweepstakes.map(s => 
      s.id === sweepstakeId
        ? { ...s, winners: raceResults, status: 'completed' as const }
        : s
    ));
  };

  // Filter sweepstakes by search query and sort by creation date
  const filteredSweepstakes = sweepstakes
    .filter(sweep => 
      sweep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sweep.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => setView('list')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Sweepstake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sweepstake Name
            </label>
            <Input
              placeholder="Enter sweepstake name"
              value={newSweepstake.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setNewSweepstake({ ...newSweepstake, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buy-in Amount ($)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter buy-in amount"
              value={newSweepstake.buyIn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setNewSweepstake({ ...newSweepstake, buyIn: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prize Distribution
            </label>
            <div className="grid gap-2">
              {newSweepstake.prizeDistribution.map((prize, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Percentage"
                    value={prize.percentage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const newDistribution = [...newSweepstake.prizeDistribution];
                      newDistribution[index] = {
                        ...prize,
                        percentage: parseInt(e.target.value) || 0
                      };
                      setNewSweepstake({
                        ...newSweepstake,
                        prizeDistribution: newDistribution
                      });
                    }}
                  />
                  <span className="text-sm text-gray-500">% for {index + 1}st place</span>
                </div>
              ))}
              {newSweepstake.prizeDistribution.reduce((acc, curr) => acc + curr.percentage, 0) < 100 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentTotal = newSweepstake.prizeDistribution.reduce(
                      (acc, curr) => acc + curr.percentage,
                      0
                    );
                    setNewSweepstake({
                      ...newSweepstake,
                      prizeDistribution: [
                        ...newSweepstake.prizeDistribution,
                        { place: newSweepstake.prizeDistribution.length + 1, percentage: 100 - currentTotal }
                      ]
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prize Place
                </Button>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={createSweepstake}
              disabled={!newSweepstake.name || newSweepstake.buyIn <= 0}
            >
              Create Sweepstake
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Melbourne Cup Sweepstakes</h1>
        <Button onClick={() => setView('create')}>
          <Plus className="mr-2" /> New Sweepstake
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search sweepstakes..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredSweepstakes.map(sweep => (
          <Card key={sweep.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{sweep.name}</h3>
                  <div className="text-sm text-gray-500 space-x-2">
                    <span>${sweep.buyIn} buy-in</span>
                    <span>•</span>
                    <span>{sweep.participants.length} participants</span>
                    <span>•</span>
                    <span className="capitalize">{sweep.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {sweep.status === 'active' && (
                    <Button 
                      variant="outline"
                      onClick={() => completeRace(sweep.id)}
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      Complete Race
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      setActiveSweepstake(sweep);
                      setView('detail');
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSweepstakeDetail = () => {
    if (!activeSweepstake) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => setView('list')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{activeSweepstake.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Buy-in</div>
                <div className="text-lg font-semibold">${activeSweepstake.buyIn}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Total Pool</div>
                <div className="text-lg font-semibold">
                  ${activeSweepstake.buyIn * activeSweepstake.participants.length}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg font-semibold capitalize">{activeSweepstake.status}</div>
              </div>
            </div>

            {activeSweepstake.status === 'setup' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Participants</h3>
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <Input
                      ref={participantInputRef}
                      placeholder="Add participant..."
                      onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          handleAddParticipant(activeSweepstake.id);
                        }
                      }}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => handleAddParticipant(activeSweepstake.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="ml-2">Add</span>
                    </Button>
                  </div>
                  <Button 
                    onClick={() => assignHorses(activeSweepstake.id)}
                    disabled={activeSweepstake.participants.length === 0}
                  >
                    <ShuffleIcon className="mr-2 h-4 w-4" />
                    Assign Horses
                  </Button>
                </div>
                <div className="grid gap-2">
                  {activeSweepstake.participants.map((participant, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{participant}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSweepstake.status === 'active' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Horse Assignments</h3>
                <div className="grid gap-2">
                  {activeSweepstake.assignments.map((assignment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{assignment.participant}</span>
                      <span className="font-medium">{assignment.horse}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => completeRace(activeSweepstake.id)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Complete Race
                </Button>
              </div>
            )}

            {activeSweepstake.status === 'completed' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Results</h3>
                <div className="grid gap-2">
                  {activeSweepstake.winners.map((winner, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{winner.place}st Place: </span>
                        <span>{winner.participant}</span>
                        <span className="ml-2 text-gray-500">({winner.horse})</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ${winner.winnings.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {view === 'list' && renderDashboard()}
      {view === 'create' && renderCreateForm()}
      {view === 'detail' && renderSweepstakeDetail()}
    </div>
  );
};

export default SweepstakeManager;
