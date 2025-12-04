'use client';
import {
  onSnapshot,
  Query,
  DocumentData,
  SnapshotListenOptions,
  QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

type UseCollectionOptions = {
  snapshotListenOptions?: SnapshotListenOptions;
};

export const useCollection = (
  query: Query<DocumentData> | null,
  options?: UseCollectionOptions
) => {
  const [data, setData] = useState<QuerySnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      options?.snapshotListenOptions || {},
      (snapshot) => {
        setData(snapshot);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query, options?.snapshotListenOptions]);

  return { data, loading, error };
};
