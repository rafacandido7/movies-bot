import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

import { Movie, MovieApiProvider } from '@app/ports'

@Injectable()
export class TmdbMovieApiProvider implements MovieApiProvider {
  constructor(private readonly httpService: HttpService) {}

  async searchMovies(movieName: string): Promise<Movie[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/search/movie?query=${encodeURIComponent(movieName)}&language=pt-BR`,
        ),
      )

      const results = response.data.results ?? []

      return results
        .filter((r: any) => r.title && r.overview)
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 5)
        .map((r: any) => ({
          id: r.id,
          title: r.title,
          overview: r.overview,
          rating: r.vote_average,
        }))
    } catch (error) {
      console.error(`Erro ao buscar filmes para "${movieName}" no TMDB:`, error)
      return []
    }
  }

  async getMovieByName(movieName: string): Promise<Movie | null> {
    const movies = await this.searchMovies(movieName)
    return movies[0] || null
  }

  async getPopularMovies(): Promise<Movie[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/movie/popular?language=pt-BR&page=1'),
      )

      const results = response.data.results

      return results.slice(0, 5).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        rating: movie.vote_average ?? 0,
      }))
    } catch (error) {
      console.error('Erro ao buscar filmes populares no TMDB:', error)
      return []
    }
  }

  async getMovieSynopsis(movieName: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/search/movie?query=${encodeURI(movieName)}&language=pt-BR`,
        ),
      )
      if (response.data.results.length === 0) return null
      return response.data.results[0].overview
    } catch (error) {
      console.error(`Erro ao buscar sinopse de ${movieName}:`, error)
      return null
    }
  }

  async getMovieCast(movieName: string): Promise<{
    title: string
    cast: { actor: string; character: string; original: boolean }[]
  } | null> {
    try {
      const results = await this.searchMovies(movieName)
      if (!results || results.length === 0) return null

      const bestMatch =
        results
          .sort((a: any, b: any) => b.popularity - a.popularity)
          .find((r: any) => r.title && r.original_title) || results[0]

      const creditsResponse = await firstValueFrom(
        this.httpService.get(`/movie/${bestMatch.id}/credits?language=pt-BR`),
      )

      const castArray = creditsResponse.data.cast || []
      const topCast = castArray.slice(0, 5).map((actor: any) => ({
        actor: actor.name,
        character: actor.character,
        original: actor.original_language === 'en',
      }))

      return {
        title: bestMatch.title,
        cast: topCast,
      }
    } catch (error) {
      console.error(`Erro ao buscar elenco do filme "${movieName}":`, error)
      return null
    }
  }

  async getMovieRating(
    movieName: string,
  ): Promise<{ title: string; rating: number }[] | null> {
    try {
      const results = await this.searchMovies(movieName)

      if (!results || results.length === 0) return null

      const filtered = results
        .filter((r: any) => typeof r.rating === 'number')
        .sort((a: any, b: any) => b.rating - a.rating)

      const options = filtered.slice(0, 5).map((r: any) => ({
        title: r.title,
        rating: r.rating ?? 0,
      }))

      return options.length > 0 ? options : null
    } catch (error) {
      console.error(`Erro ao buscar nota do filme "${movieName}":`, error)
      return null
    }
  }

  async findSimilarMovies(movieName: string): Promise<Movie[] | null> {
    try {
      const searchResponse = await firstValueFrom(
        this.httpService.get(
          `/search/movie?query=${encodeURIComponent(movieName)}&language=pt-BR`,
        ),
      )

      const results = searchResponse.data.results
      if (!results || results.length === 0) return null

      const bestMatch = results[0]
      const movieId = bestMatch.id

      const maxPages = 5
      const randomPage = Math.floor(Math.random() * maxPages) + 1

      const similarResponse = await firstValueFrom(
        this.httpService.get(
          `/movie/${movieId}/similar?language=pt-BR&page=${randomPage}`,
        ),
      )

      const similarMoviesRaw = similarResponse.data.results
      if (!similarMoviesRaw || similarMoviesRaw.length === 0) return null

      const similarMovies: Movie[] = similarMoviesRaw.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        rating: movie.vote_average ?? 0,
      }))

      return similarMovies
    } catch (error) {
      console.error(
        `Erro ao buscar filmes similares para "${movieName}":`,
        error,
      )
      return null
    }
  }

  async getRecommendationByGenre(
    genre: string,
    page = 1,
  ): Promise<Movie[] | null> {
    try {
      const genreMap: Record<string, number> = {
        ação: 28,
        aventura: 12,
        animação: 16,
        comédia: 35,
        crime: 80,
        documentário: 99,
        drama: 18,
        família: 10751,
        fantasia: 14,
        história: 36,
        terror: 27,
        musical: 10402,
        mistério: 9648,
        romance: 10749,
        ficção: 878,
        suspense: 53,
        guerra: 10752,
        faroeste: 37,
      }

      const genreId = genreMap[genre.toLowerCase()]
      if (!genreId) return null

      const response = await firstValueFrom(
        this.httpService.get(
          `/discover/movie?with_genres=${genreId}&language=pt-BR&sort_by=popularity.desc&page=${page}`,
        ),
      )

      const results = response.data.results

      if (!results || results.length === 0) return null

      return results
        .filter(
          (m: any) =>
            m.overview && m.title && typeof m.vote_average === 'number',
        )
        .slice(0, 3)
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          rating: movie.vote_average ?? 0,
        }))
    } catch (error) {
      console.error(
        `Erro ao buscar recomendação para o gênero "${genre}":`,
        error,
      )
      return null
    }
  }
}
