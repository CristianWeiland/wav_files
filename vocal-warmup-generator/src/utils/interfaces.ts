interface ExerciseInterface {
  exerciseId: number;
  name: string;
  range: {
    begin: number,
    end: number
  };
  //speed: number,
}

interface WarmupInterface {
  id: number;
  name: string;
  exercises: Exercise[];
}

export {
  ExerciseInterface,
  WarmupInterface,
};
