import React from 'react';
import { MathExercise } from '../../types/math';
import { ZahlenstrahlView } from './ZahlenstrahlView';
import { ZahlenmauerView } from './ZahlenmauerView';
import { RechenradView } from './RechenradView';
import { RechentabelleView } from './RechentabelleView';
import { AufgabenfamilieView } from './AufgabenfamilieView';
import { StellenwertHZEView } from './StellenwertHZEView';
import { NachbarzahlenView } from './NachbarzahlenView';
import { DoublingHalvingView } from './DoublingHalvingView';
import { GroessenvergleichView } from './GroessenvergleichView';
import { ZahlenfolgenView } from './ZahlenfolgenView';
import { HalbschriftlichView } from './HalbschriftlichView';
import { GeldbetragView } from './GeldbetragView';
import { SachaufgabeView } from './SachaufgabeView';
import { StandardArithmeticView } from './StandardArithmeticView';

interface MathExerciseDispatcherProps {
  exercise: MathExercise;
  onSolve: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const MathExerciseDispatcher: React.FC<MathExerciseDispatcherProps> = ({
  exercise,
  onSolve,
  disabled = false,
}) => {
  switch (exercise.type) {
    case 'zahlenstrahl':
      return <ZahlenstrahlView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'zahlenmauer':
      return <ZahlenmauerView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'rechenrad':
      return <RechenradView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'rechentabelle':
      return <RechentabelleView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'aufgabenfamilie':
      return <AufgabenfamilieView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'stellenwert_hze':
      return <StellenwertHZEView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'nachbarzahlen':
      return <NachbarzahlenView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'verdoppeln_halbieren':
      return <DoublingHalvingView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'groessenvergleich':
      return <GroessenvergleichView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'zahlenfolgen':
      return <ZahlenfolgenView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'halbschriftlich':
      return <HalbschriftlichView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'geldbetrag':
      return <GeldbetragView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'sachaufgabe':
      return <SachaufgabeView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    case 'addition_1000':
    case 'subtraction_1000':
    case 'multiplication_facts':
    case 'division_facts':
    case 'fehlende_zehner_hunderter':
      return <StandardArithmeticView exercise={exercise} onSolve={onSolve} disabled={disabled} />;
    default:
      return <div>Unbekannter Aufgabentyp</div>;
  }
};
