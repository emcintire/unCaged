import { Dispatch, SetStateAction } from 'react';

export type SetState<Value> = Dispatch<SetStateAction<Value>>;
