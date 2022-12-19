import { QueryStatus, useRepositoryQuery } from "./useRepositoryQuery";
import { renderHook } from "@testing-library/react-hooks";
import { observer } from "mobx-react";
import { ReactNode } from "react";

const Wrapper = observer(({ children }: { children: ReactNode }) => {
  return <>{children}</>;
});

describe("useMobxExampleHook()", () => {
  test("given successful call to fetchFn should return success", async () => {
    // arrange
    const getFn = vi.fn().mockReturnValue(undefined);
    const fetchPromise = new Promise((resolve) => resolve({ data: "data" }));
    const fetchFn = vi.fn().mockImplementation(() => fetchPromise);
    const queryKey = ["query-key-1"];
    const options = { getFn, fetchFn, queryKey };

    // act
    const hook = renderHook(() => useRepositoryQuery(options), {
      wrapper: Wrapper,
    });
    await fetchPromise;

    // assert
    expect(hook.result.current.status).toBe(QueryStatus.Success);
  });
});
