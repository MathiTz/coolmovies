import React, { useState } from "react"
import { NextPage } from "next"
import { useRouter } from "next/router"
import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Modal,
  Skeleton,
  Typography,
  Rating,
  TextField,
  ListItemButton,
} from "@mui/material"
import { MoviesReviewDocument, useCreateMovieReviewMutation, useCurrentUserQuery, useMoviesReviewQuery } from "../../../generated/graphql"
import { Movie } from "./index.types"
import { style } from "./style"

const NewReviewPage: NextPage = () => {
  const router = useRouter()
  const { data: moviesData, loading: moviesLoading } = useMoviesReviewQuery()
  const { data: userData } = useCurrentUserQuery()

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [rating, setRating] = useState<number | null>(0)
  const [reviewText, setReviewText] = useState("")
  const [open, setOpen] = useState(false)
  const [createReview] = useCreateMovieReviewMutation()

  const handleOpen = (movie: any) => {
    setSelectedMovie(movie)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedMovie(null)
    setRating(0)
    setReviewText("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMovie || rating === null) return

    try {
      const { errors } = await createReview({
        variables: {
          movieId: selectedMovie.id,
          rating: rating,
          title: reviewText,
          userReviewerId: userData?.currentUser?.id,
        },
        refetchQueries: [{ query: MoviesReviewDocument }],
        awaitRefetchQueries: true,
      })

      if (errors) {
        console.error(errors)
        return
      }

      router.push("/reviews")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#e0f7fa", minHeight: "100vh" }}>
      <Typography variant="h2" component="h1" gutterBottom color="primary">
        Inserir Review
      </Typography>

      {moviesLoading && (
        <Skeleton
          sx={{ bgcolor: "grey.300", marginBottom: 4 }}
          variant="rectangular"
          width="100%"
          height={150}
        />
      )}

      {moviesData && moviesData.allMovies && moviesData.allMovies.edges.length > 0 && (
        <Card sx={{ backgroundColor: "#ffffff", marginBottom: 4 }}>
          <CardContent>
            <Typography variant="h4" color="secondary" gutterBottom>
              Filmes Disponíveis
            </Typography>
            <List>
              {moviesData.allMovies?.edges.map(({ node: movie }) => (
                <ListItemButton key={movie?.id} onClick={() => handleOpen(movie)}>
                  <ListItemText
                    primary={movie?.title}
                    secondary={`Data de Lançamento: ${new Date(movie?.releaseDate).toLocaleDateString()}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-review-title"
        aria-describedby="modal-review-description"
      >
        <Box sx={style} component="form" onSubmit={handleSubmit}>
          <Typography id="modal-review-title" variant="h6" component="h2" gutterBottom>
            {selectedMovie?.title} - Nova Review
          </Typography>
          <Typography variant="body1" gutterBottom>
            Escolha uma nota:
          </Typography>
          <Rating
            name="user-rating"
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            precision={1}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="O que você achou do filme?"
            multiline
            rows={4}
            fullWidth
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} variant="outlined" sx={{ marginRight: 1 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Enviar Review
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default NewReviewPage
