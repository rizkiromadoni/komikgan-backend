import { and, count, desc, eq, inArray } from "drizzle-orm"
import { db } from "../db"
import { bookmarks, series } from "../db/schema"

const bookmarkModel = {
    getSeriesBookmarks: async ({ serieId, userId }: { serieId: number, userId?: number }) => {
        const counts = await db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.serieId, serieId))

        let isBookmarked = false
        if (userId) {
            const bookmarked = await db.query.bookmarks.findFirst({
                where: and(eq(bookmarks.serieId, serieId), eq(bookmarks.userId, userId))
            })

            if (bookmarked) {
                isBookmarked = true
            }
        }

        return {
            count: counts[0].count,
            isBookmarked
        }
    },
    getUserBookmarks: async ({ userId, page = 1, limit = 9 }: { userId: number, page?: number, limit?: number }) => {
        const serieIds = await db.select({ serieId: bookmarks.serieId }).from(bookmarks).where(eq(bookmarks.userId, userId))

        if (serieIds.length === 0) {
          return {
            totalPages: 1,
            count: 0,
            series: []
          }
        }

        const results = await db.query.series.findMany({
            columns: {
              id: true,
              title: true,
              slug: true,
              description: true,
              imageUrl: true,
              seriesStatus: true,
              seriesType: true,
              rating: true,
              status: true,
              createdAt: true,
              updatedAt: true
            },
            where: and(
              inArray(series.id, serieIds.map((s) => s.serieId)),
              eq(series.status, "published")
            ),
            orderBy: [desc(series.updatedAt)],
            limit: limit,
            offset: (page - 1) * limit,
            with: {
              seriesToGenres: {
                with: { genre: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true
                  }
                } }
              },
              user: {
                columns: {
                  username: true
                }
              }
            }
          })
      
          const mappedSeries = results.map((serie) => {
            const genres = serie.seriesToGenres.map((s) => s.genre)
            return {
              ...serie,
              genres,
              seriesToGenres: undefined
            }
          })
      
          return {
            totalPages: Math.ceil(serieIds.length / limit),
            count: serieIds.length,
            series: mappedSeries
          }
    },
    createBookmark: async ({ serieId, userId }: { serieId: number, userId: number }) => {
        const bookmark = await db
        .insert(bookmarks)
        .values({
            serieId,
            userId
        })
        .returning()
    
        return bookmark[0]
    },
    deleteBookmark: async ({ serieId, userId }: { serieId: number, userId: number }) => {
        const deletedBookmark = await db
        .delete(bookmarks)
        .where(and(eq(bookmarks.serieId, serieId), eq(bookmarks.userId, userId)))
        .returning()
    
        return deletedBookmark[0]
    }
}

export default bookmarkModel