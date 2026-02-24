import { useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { getHomeGalleryItems, getHomeGalleryProgress, getCurrentHomeScene } from '../../game/selectors/homeLife'
import { Modal } from './Modal'
import type { HomeLifeItem, FamilyPhoto, ChildDrawing, RyanMessage } from '../../game/data/homeLife'

export function HomeGallery() {
  const state = useGameState()
  const galleryItems = getHomeGalleryItems(state)
  const progress = getHomeGalleryProgress(state)
  const homeScene = getCurrentHomeScene(state)
  const [selectedItem, setSelectedItem] = useState<HomeLifeItem | null>(null)

  return (
    <section style={{ marginTop: 24 }}>
      {/* Home Scene Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(139, 90, 43, 0.3) 0%, rgba(74, 50, 28, 0.3) 100%)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          border: '1px solid rgba(139, 90, 43, 0.4)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.2rem',
            color: 'var(--color-text, #e0e0e0)',
            fontFamily: 'Georgia, serif',
          }}
        >
          {homeScene.title}
        </h3>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted, #a0a0a0)',
            fontStyle: 'italic',
          }}
        >
          {homeScene.description}
        </p>
      </div>

      {/* Progress indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted, #a0a0a0)',
          }}
        >
          Collection Progress
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            background: 'var(--color-surface, #2a2a2a)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(progress.unlocked / progress.total) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8b5a2b, #d4a574)',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text, #e0e0e0)',
            minWidth: '50px',
          }}
        >
          {progress.unlocked}/{progress.total}
        </span>
      </div>

      {/* Gallery Grid */}
      <div
        className="home-gallery"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {galleryItems.map(({ item, unlocked }) => (
          <GalleryCard
            key={item.data.id}
            item={item}
            unlocked={unlocked}
            onClick={() => unlocked && setSelectedItem(item)}
          />
        ))}
      </div>

      {/* Full-screen viewer modal */}
      {selectedItem && (
        <Modal
          title={getItemTitle(selectedItem)}
          onClose={() => setSelectedItem(null)}
        >
          <ItemViewer item={selectedItem} />
        </Modal>
      )}
    </section>
  )
}

interface GalleryCardProps {
  item: HomeLifeItem
  unlocked: boolean
  onClick: () => void
}

function GalleryCard({ item, unlocked, onClick }: GalleryCardProps) {
  const icon = getItemIcon(item.type)

  if (!unlocked) {
    return (
      <button
        type="button"
        className="gallery-card locked"
        onClick={onClick}
        disabled
        aria-label={`Locked: ${item.data.id}`}
        style={{
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface, #2a2a2a)',
          border: '2px dashed var(--color-border, #404040)',
          borderRadius: 12,
          cursor: 'not-allowed',
          opacity: 0.5,
          minHeight: 120,
        }}
      >
        <span style={{ fontSize: '2rem', opacity: 0.4 }}>???</span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted, #707070)',
            marginTop: 8,
          }}
        >
          Locked
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className="gallery-card"
      onClick={onClick}
      style={{
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface, #2a2a2a)',
        border: '2px solid var(--color-border, #404040)',
        borderRadius: 12,
        cursor: 'pointer',
        minHeight: 120,
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        padding: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.borderColor = 'rgba(139, 90, 43, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = 'var(--color-border, #404040)'
      }}
    >
      <span style={{ fontSize: '2.5rem' }}>{icon}</span>
      <span
        style={{
          fontSize: '0.8rem',
          color: 'var(--color-text, #e0e0e0)',
          marginTop: 8,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {getItemTitle(item)}
      </span>
      <span
        style={{
          fontSize: '0.7rem',
          color: 'var(--color-text-muted, #707070)',
          marginTop: 4,
        }}
      >
        {getItemSubtitle(item)}
      </span>
    </button>
  )
}

interface ItemViewerProps {
  item: HomeLifeItem
}

function ItemViewer({ item }: ItemViewerProps) {
  switch (item.type) {
    case 'photo':
      return <PhotoViewer photo={item.data} />
    case 'drawing':
      return <DrawingViewer drawing={item.data} />
    case 'message':
      return <MessageViewer message={item.data} />
  }
}

function PhotoViewer({ photo }: { photo: FamilyPhoto }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Placeholder for photo - in real implementation would use actual images */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          background: 'linear-gradient(135deg, #3a3a3a, #2a2a2a)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          fontSize: '4rem',
        }}
      >
        📷
      </div>
      <p
        style={{
          fontStyle: 'italic',
          color: 'var(--color-text, #e0e0e0)',
          lineHeight: 1.6,
        }}
      >
        {photo.description}
      </p>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted, #a0a0a0)',
          marginTop: 8,
        }}
      >
        {photo.year}
      </p>
    </div>
  )
}

function DrawingViewer({ drawing }: { drawing: ChildDrawing }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Placeholder for drawing - in real implementation would use actual images */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: 'linear-gradient(135deg, #f5f0e6, #e8dcc8)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          fontSize: '4rem',
          color: '#5a4a3a',
        }}
      >
        🎨
      </div>
      <p
        style={{
          fontStyle: 'italic',
          color: 'var(--color-text, #e0e0e0)',
          lineHeight: 1.6,
        }}
      >
        {drawing.description}
      </p>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted, #a0a0a0)',
          marginTop: 8,
        }}
      >
        By {drawing.artist}, age {drawing.age}
      </p>
    </div>
  )
}

function MessageViewer({ message }: { message: RyanMessage }) {
  return (
    <div
      style={{
        textAlign: 'left',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface, #2a2a2a)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          borderLeft: '4px solid #8b5a2b',
        }}
      >
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.1rem',
            color: 'var(--color-text, #e0e0e0)',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}
        >
          {message.body}
        </p>
      </div>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted, #a0a0a0)',
          textAlign: 'right',
        }}
      >
        — Ryan
      </p>
    </div>
  )
}

function getItemIcon(type: HomeLifeItem['type']): string {
  switch (type) {
    case 'photo':
      return '📷'
    case 'drawing':
      return '🎨'
    case 'message':
      return '💌'
  }
}

function getItemTitle(item: HomeLifeItem): string {
  switch (item.type) {
    case 'photo':
      return item.data.title
    case 'drawing':
      return item.data.title
    case 'message':
      return item.data.title
  }
}

function getItemSubtitle(item: HomeLifeItem): string {
  switch (item.type) {
    case 'photo':
      return item.data.year
    case 'drawing':
      return item.data.artist
    case 'message':
      return 'From Ryan'
  }
}
