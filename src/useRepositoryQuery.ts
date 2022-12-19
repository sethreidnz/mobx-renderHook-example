import { makeObservable, observable, when } from "mobx";
import { useEffect, useMemo } from "react";

export function useRepositoryQuery(options: {
  getFn: () => any;
  fetchFn: () => Promise<any>;
  queryKey: string[];
}) {
  const query = useMemo(() => new RepositoryQuery(options), [options]);
  const data = query.getFn();
  useEffect(
    () =>
      when(
        () => query.shouldFetch(),
        async () => await query.executeFetch()
      ),
    [query]
  );
  return { ...query.state, data };
}

export type FetchFunction<T> = () => Promise<T>;
export type GetFunction<T> = () => T | undefined;
export type QueryKey = readonly string[];
export type RepositoryQueryResult<TData, TError> = RepositoryQueryData<TData> &
  RepositoryQueryState<TError>;

export enum QueryStatus {
  Loading = "loading",
  Error = "error",
  Success = "success",
}

export enum FetchStatus {
  Loading = "fetching",
  Idle = "idle",
  Success = "success",
  Error = "error",
}

export type RepositoryQueryOptions<TData> = {
  fetchFn: FetchFunction<TData>;
  getFn: GetFunction<TData>;
  queryKey: QueryKey;
};

export class RepositoryQuery<TData, TError> {
  @observable private _state: RepositoryQueryState<TError>;
  readonly fetchFn: FetchFunction<TData>;
  readonly getFn: GetFunction<TData>;
  readonly queryKey: QueryKey;
  readonly queryHash: string;
  constructor({
    getFn,
    fetchFn,
    queryKey,
  }: {
    getFn: GetFunction<TData>;
    fetchFn: FetchFunction<TData>;
    queryKey: QueryKey;
  }) {
    makeObservable(this);
    this.getFn = getFn;
    this.fetchFn = fetchFn;
    this.queryKey = queryKey;
    this.queryHash = JSON.stringify(queryKey);
    const data = this.getFn();
    if (data) {
      this._state = {
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        status: QueryStatus.Success,
        fetchStatus: FetchStatus.Success,
      };
    } else {
      this._state = {
        error: null,
        isError: false,
        isLoading: true,
        isSuccess: false,
        status: QueryStatus.Loading,
        fetchStatus: FetchStatus.Idle,
      };
    }
  }

  public async executeFetch() {
    try {
      if (this.shouldFetch()) {
        console.log("start setFetching()");
        this.setFetching();
        console.log("finished setFetching()");
        console.log("start fetchFn()");
        await this.fetchFn();
        console.log("start fetchFn()");
        console.log("start setSuccess()");
        this.setSuccess();
        console.log("start setSuccess()");
      }
    } catch (error) {
      this.setError(error as TError);
    }
  }

  public setSuccess() {
    this._state = {
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: true,
      status: QueryStatus.Success,
      fetchStatus: FetchStatus.Success,
    };
  }

  public setFetching() {
    const data = this.getFn();
    if (data) {
      this._state = {
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        status: QueryStatus.Success,
        fetchStatus: FetchStatus.Loading,
      };
    } else {
      this._state = {
        error: null,
        isError: false,
        isLoading: true,
        isSuccess: false,
        status: QueryStatus.Loading,
        fetchStatus: FetchStatus.Loading,
      };
    }
  }

  public setError(error: TError) {
    this._state = {
      error: error as TError,
      isError: true,
      isLoading: false,
      isSuccess: false,
      status: QueryStatus.Error,
      fetchStatus: FetchStatus.Error,
    };
  }

  public shouldFetch() {
    return this._state.fetchStatus === FetchStatus.Idle;
  }

  public get state() {
    return this._state;
  }
}

interface RepositoryQueryData<TData> {
  data: TData | undefined;
}

export type RepositoryQueryState<TError> =
  | RepositoryQueryLoadingState
  | RepositoryQuerySuccessState
  | RepositoryQueryLoadingErrorState<TError>;

interface RepositoryQueryStateBase<TError = unknown> {
  error: TError | null;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  status: QueryStatus;
  fetchStatus: FetchStatus;
}

export interface RepositoryQuerySuccessState<TError = unknown>
  extends RepositoryQueryStateBase<TError> {
  error: null;
  isError: false;
  isLoading: false;
  isSuccess: true;
  status: QueryStatus.Success;
  fetchStatus: FetchStatus.Loading | FetchStatus.Success;
}

export interface RepositoryQueryLoadingErrorState<TError = unknown> {
  error: TError;
  isError: true;
  isLoading: false;
  isSuccess: false;
  status: QueryStatus.Error;
  fetchStatus: FetchStatus.Error;
}

export interface RepositoryQueryLoadingState<TError = unknown>
  extends RepositoryQueryStateBase<TError> {
  error: null;
  isError: false;
  isLoading: true;
  isSuccess: false;
  status: QueryStatus.Loading;
  fetchStatus: FetchStatus.Loading | FetchStatus.Idle;
}
