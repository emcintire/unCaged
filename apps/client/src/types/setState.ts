import { type Dispatch, type SetStateAction } from 'react';

export type SetState<Value> = Dispatch<SetStateAction<Value>>;
