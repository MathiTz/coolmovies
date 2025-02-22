import React from "react"
import { NextPage } from "next"
import { useMoviesReviewQuery } from "../../generated/graphql"
import { Box, Card, CardContent, List, Skeleton, Typography, Rating } from "@mui/material"

const ReviewsPage: NextPage = () => {
  const { data, loading } = useMoviesReviewQuery()

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e0f7fa" }}>
      <Typography variant="h2" component="h1" gutterBottom color="primary">
        Reviews Page
      </Typography>
      {loading && (
        <Skeleton
          sx={{ bgcolor: "grey.300", marginBottom: 4 }}
          variant="rectangular"
          width="100%"
          height={150}
        />
      )}
      {data &&
        data.allMovies?.edges.map(({ node: movie }) => (
          <Card key={movie?.id} sx={{ marginBottom: 4, backgroundColor: "#ffffff" }}>
            <CardContent>
              <Typography variant="h4" color="secondary">
                {movie?.title}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Release date: {new Date(movie?.releaseDate).toLocaleDateString()}
              </Typography>
              <Typography variant="h5" sx={{ marginBottom: 2, color: "#424242" }}>
                Reviews
              </Typography>
              <List>
                {movie?.movieReviewsByMovieId?.edges.map(({ node: review }) => (
                  <Box
                    key={review?.id}
                    sx={{
                      paddingY: 1,
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    <Typography variant="h6">"{review?.title}"</Typography>
                    <Rating
                      name="read-only-rating"
                      value={Number(review?.rating)}
                      readOnly
                      sx={{ marginY: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      User: {review?.userByUserReviewerId?.name}
                    </Typography>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
    </Box>
  )
}

export default ReviewsPage
