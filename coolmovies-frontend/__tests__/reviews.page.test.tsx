import React from "react"
import {
  render,
  waitFor
} from '@testing-library/react'
import { MockedProvider } from "@apollo/client/testing"
import "@testing-library/jest-dom";
import { MoviesReviewDocument } from "../src/generated/graphql";
import ReviewsPage from "../src/pages/reviews";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";

// Create a simple mocked router
const createMockRouter = (router: any) => ({
  route: "/",
  pathname: "/",
  query: {},
  asPath: "/",
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  ...router,
})

const reviewsMock = {
  request: {
    query: MoviesReviewDocument,
  },
  result: {
    data: {
      allMovies: {
        edges: [
          {
            node: {
              id: "1",
              title: "Test Movie",
              releaseDate: "2025-02-22T00:00:00.000Z",
              movieReviewsByMovieId: {
                edges: [
                  {
                    node: {
                      id: "r1",
                      rating: 5,
                      title: "Awesome review",
                      userByUserReviewerId: { id: "u1", name: "John Doe" },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  },
}

const setup = (routerOverrides = {}) => {
  const mockRouter = createMockRouter(routerOverrides)
  return {
    ...render(
      <RouterContext.Provider value={mockRouter}>
        <MockedProvider mocks={[reviewsMock]} addTypename={false}>
          <ReviewsPage />
        </MockedProvider>
      </RouterContext.Provider>
    )
  }
}

describe("ReviewsPage", () => {
  it("shows loading state then renders the movie review", async () => {
    const { getByText } = setup()

    // Wait for the movie title to be rendered.
    await waitFor(() =>
      expect(getByText("Test Movie")).toBeInTheDocument()
    )

    // Check that the review title is rendered.
    expect(getByText(/Awesome review/i)).toBeInTheDocument()
    // Check that the review user is rendered.
    expect(getByText(/User: John Doe/i)).toBeInTheDocument()
  })
})
