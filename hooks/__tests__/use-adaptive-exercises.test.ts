import { renderHook, act } from "@testing-library/react"
import { useAdaptiveExercises } from "../use-adaptive-exercises"
import type { IExerciseStore } from "@/lib/interfaces/exercise-store.interface"
import { vi } from "vitest"

describe("useAdaptiveExercises", () => {
  let mockStore: IExerciseStore;

  beforeEach(() => {
    mockStore = {
      profile: null,
      currentExercise: null,
      recommendations: [],
      isLoading: false,
      practiceContext: "",
      practiceGoal: "",
      initializeProfile: vi.fn().mockResolvedValue(undefined),
      setPracticeContext: vi.fn(),
      setPracticeGoal: vi.fn(),
      completeSession: vi.fn(),
      selectExercise: vi.fn(),
      generateCustomExercise: vi.fn().mockResolvedValue({} as any),
    };
  });

  it("should not initialize profile on mount by default", () => {
    renderHook(() => useAdaptiveExercises({ store: mockStore }));
    expect(mockStore.initializeProfile).not.toHaveBeenCalled();
  });

  it("should initialize profile on mount when autoInitialize is true", () => {
    renderHook(() => useAdaptiveExercises({ store: mockStore, autoInitialize: true }));
    expect(mockStore.initializeProfile).toHaveBeenCalledTimes(1);
  });

  it("should call initialize manually", async () => {
    const { result } = renderHook(() => useAdaptiveExercises({ store: mockStore }));

    await act(async () => {
      await result.current.initialize();
    });

    expect(mockStore.initializeProfile).toHaveBeenCalledTimes(1);
  });

  it("should handle initialization errors and call onInitError", async () => {
    const error = new Error("Initialization failed");
    mockStore.initializeProfile = vi.fn().mockRejectedValue(error);
    const onInitError = vi.fn();

    renderHook(() => useAdaptiveExercises({ store: mockStore, autoInitialize: true, onInitError }));

    // Wait for the async effect to complete
    await vi.waitFor(() => {
      expect(onInitError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
