"use client";

import React, { useState, useEffect } from 'react';
import { useTournamentPrediction } from '@/hooks/useTournamentPrediction';
import { ChampionPickModal } from './ChampionPickModal';

const SHOWN_KEY = 'autoChampionModal:shown';

function readShown(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SHOWN_KEY) === '1';
  } catch {
    return false;
  }
}

function markShown() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SHOWN_KEY, '1');
  } catch {
    // Ignore — quota / private mode.
  }
}

export function AutoChampionModal() {
  const { data: championData, isLoading, isSuccess } = useTournamentPrediction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState<boolean>(() => readShown());

  useEffect(() => {
    if (isLoading || !isSuccess || !championData) return;
    if (hasShownThisSession) return;

    const { prediction, isLocked } = championData;
    if (prediction || isLocked) return;

    const timer = setTimeout(() => {
      setIsModalOpen(true);
      setHasShownThisSession(true);
      markShown();
    }, 1000);

    return () => clearTimeout(timer);
  }, [championData, isLoading, isSuccess, hasShownThisSession]);

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
