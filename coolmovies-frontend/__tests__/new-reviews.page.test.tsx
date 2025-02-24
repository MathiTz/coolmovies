import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime"
import { MockedProvider } from "@apollo/client/testing"
import {
  MoviesReviewDocument,
  CurrentUserDocument,
  CreateMovieReviewDocument,
} from "../src/generated/graphql"
import NewReviewPage from "../src/pages/reviews/create"

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

const moviesMock = {
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
              movieReviewsByMovieId: { edges: [] },
            },
          },
        ],
      },
    },
  },
}

const currentUserMock = {
  request: {
    query: CurrentUserDocument,
  },
  result: {
    data: {
      currentUser: {
        id: "u1",
        name: "John Doe",
      },
    },
  },
}

const createReviewMock = {
  request: {
    query: CreateMovieReviewDocument,
    variables: {
      movieId: "1",
      rating: 5,
      title: "Awesome new review",
      userReviewerId: "u1",
    },
  },
  result: {
    data: {
      createMovieReview: {
        id: "r1",
        rating: 5,
        title: "Awesome new review",
      },
    },
  },
}

const setup = (routerOverrides = {}) => {
  const mockRouter = createMockRouter(routerOverrides)
  return {
    ...render(
      <RouterContext.Provider value={mockRouter}>
        <MockedProvider
          // Added a duplicate moviesMock entry to handle the refetch/extra query call.
          mocks={[moviesMock, currentUserMock, createReviewMock, moviesMock]}
          addTypename={false}
        >
          <NewReviewPage />
        </MockedProvider>
      </RouterContext.Provider>
    ),
    mockRouter,
  }
}

describe("NewReviewPage", () => {
  it("renders available movies and opens the modal on click", async () => {
    setup()

    // Wait for the movie title to be rendered.
    await waitFor(() =>
      expect(screen.getByText("Test Movie")).toBeInTheDocument()
    )

    // Simulate clicking on the movie to open the modal.
    fireEvent.click(screen.getByText("Test Movie"))

    // Check that the modal shows the movie title.
    await waitFor(() =>
      expect(screen.getByTestId("modal-review-title")).toHaveTextContent("Test Movie - Nova Review")
    )
  })

  it("redirects to /reviews after successfully creating a review", async () => {
    const { mockRouter } = setup()

    // Wait for the movie title to be rendered.
    await waitFor(() =>
      expect(screen.getByText("Test Movie")).toBeInTheDocument()
    )

    // Open the modal.
    fireEvent.click(screen.getByText("Test Movie"))

    // Wait for the modal to open using a custom matcher that verifies both strings are present.
    await waitFor(() =>
      expect(
        screen.getByText((content, element) => {
          return (
            content.includes("Test Movie") &&
            content.includes("Nova Review")
          )
        })
      ).toBeInTheDocument()
    )

    // Fill in the review text.
    fireEvent.change(screen.getByLabelText(/O que você achou do filme\?/i), {
      target: { value: "Awesome new review" },
    })

    // Instead of looking for a "radiogroup", query for the individual stars.
    // MUI Rating renders each star with the role "radio".
    const stars = await screen.findAllByRole("radio")
    // Click the 5th star (index 4) to set the rating to 5.
    fireEvent.click(stars[4])

    // Click the "Enviar Review" button to submit.
    fireEvent.click(screen.getByText("Send Review"))

    // Wait for router.push to be called with "/reviews"
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/reviews")
    })
  })
})
