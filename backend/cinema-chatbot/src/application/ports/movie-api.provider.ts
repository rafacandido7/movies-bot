export type Movie = {
  vote_average: null
  id: number
  title: string
  overview: string
  rating: number
}

export abstract class MovieApiProvider {
  abstract getMovieByName(movieName: string): Promise<Movie | null>

  abstract searchMovies(movieName: string): Promise<Movie[]>

  abstract getMovieCast(movieName: string): Promise<{
    title: string
    cast: { actor: string; character: string; original: boolean }[]
  } | null>

  abstract getMovieRating(
    movieName: string,
  ): Promise<{ title: string; rating: number }[] | null>

  abstract getPopularMovies(): Promise<Movie[]>

  abstract findSimilarMovies(
    movieName: string,
    page?: number,
  ): Promise<Movie[] | null>

  abstract getRecommendationByGenre(
    genre: string,
    page?: number,
  ): Promise<Movie[] | null>
}
