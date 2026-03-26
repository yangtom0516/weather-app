import { Typography } from 'antd';

const { Title } = Typography;

export default function VideoSection({ location, videos }) {
  if (!videos || !videos.length) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <Title level={4} style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>
        Videos — {location}
      </Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {videos.map(video => (
          <div
            key={video.video_id}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${video.video_id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.4,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {video.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                {video.channel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
