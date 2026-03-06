import express from 'express'

popupRouter.get('/services', async (req, res) => {
    console.log('HIT /services route', req.query)
  const { lat, lng, type } = req.query
  if (!lat || !lng || !type) return res.status(400).json({ error: 'lat, lng and type required' })

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    )
    const data = await response.json()
    const top3 = (data.results || [])
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map(place => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        placeId: place.place_id,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        openNow: place.opening_hours?.open_now
      }))
    res.json(top3)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
})

export default popupRouter