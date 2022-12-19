import { QueryStatus, useRepositoryQuery } from "./useRepositoryQuery";
import { renderHook } from "@testing-library/react-hooks";
import { render, screen } from "@testing-library/react";
import { observer } from "mobx-react";
import { ReactNode } from "react";

describe("useRepositoryQuery()", () => {
  test("given successful call to fetchFn should return success", async () => {
    // arrange
    const getFn = vi.fn().mockReturnValue(undefined);
    const fetchPromise = new Promise((resolve) => resolve({ data: "data" }));
    const fetchFn = vi.fn().mockImplementation(() => fetchPromise);
    const queryKey = ["query-key-1"];
    const options = { getFn, fetchFn, queryKey };
    const Wrapper = observer(({ children }: { children: ReactNode }) => {
      return <>{children}</>;
    });

    // act
    const hook = renderHook(() => useRepositoryQuery(options), {
      wrapper: Wrapper,
    });
    await fetchPromise;

    // assert
    expect(hook.result.current.status).toBe(QueryStatus.Success);
  });

  test("given successful call to fetchFn should return success", async () => {
    // arrange
    const data = { data: "data" };
    const getFn = vi.fn().mockReturnValue(undefined);
    const fetchFn = vi.fn().mockResolvedValue(data);
    const queryKey = ["query-key-1"];
    const options = { getFn, fetchFn, queryKey };
    const Wrapper = observer(() => {
      const query = useRepositoryQuery(options);
      if (query.isLoading) return null;
      return <div>Success</div>;
    });

    // act
    const hook = render(<Wrapper />);

    // assert
    await screen.findByText("Success");
  });
});
