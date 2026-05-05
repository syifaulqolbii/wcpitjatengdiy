"use client";

import React, { useState, useEffect } from 'react';
import { useTournamentPrediction } from '@/hooks/useTournamentPrediction';
import { ChampionPickModal } from './ChampionPickModal';

export function AutoChampionModal() {
  const { data: championData, isLoading } = useTournamentPrediction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    if (!isLoading && championData) {
      const { prediction, isLocked } = championData;
      
      if (!prediction && !isLocked && !hasShownThisSession) {
        // Show after 1 second delay
        const timer = setTimeout(() => {
          setIsModalOpen(true);
          setHasShownThisSession(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [championData, isLoading, hasShownThisSession]);

  if (!championData) return null;

  return (
    <ChampionPickModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      existingPrediction={championData.prediction}
      deadline={championData.deadline}
      bonusPoints={championData.bonusPoints}
    />
  );
}
