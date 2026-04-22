# gares_voyageurs_gtfsrt_snapshot.pb

**Sprint 2 roadmap catalogue-demos v1.0.0 — fallback CDN GTFS-RT SNCF.**

## Origine

- **Source :** `https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-trip-updates`
- **Format :** GTFS-Realtime protobuf ([gtfs-realtime.proto](https://github.com/google/transit/blob/master/gtfs-realtime/proto/gtfs-realtime.proto) — FeedMessage)
- **Rôle :** Servi par `PollingSource.fallbackUrl` quand le proxy transport.data.gouv.fr est indisponible (HTTP non-2xx ou erreur réseau). Décodé côté plugin par `GtfsRtDecoder` (lecture via `resp.arrayBuffer()`).

## Contenu

FeedMessage GTFS-RT minimal valide (entête seul, zéro entité) — suffisant pour que le décodeur plugin accepte le payload sans erreur et laisse la couche servir les gares statiques sans mise à jour live. Une mise à jour ultérieure peut inclure un échantillon de `trip_update` pour animer la démo.

## Régénération

Capturer une frame vivante du flux SNCF :

```bash
curl -L --output gares_voyageurs_gtfsrt_snapshot.pb \
  https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-trip-updates
```

Puis committer le `.pb` et ce README.

## Validation

```bash
node -e "const fs=require('fs'); const b=fs.readFileSync('gares_voyageurs_gtfsrt_snapshot.pb'); console.log('bytes:', b.length, 'header:', b[0].toString(16));"
```

Un FeedMessage protobuf commence par le tag `0x0a` (field 1, wire type 2 — header).
