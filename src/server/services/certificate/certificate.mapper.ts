import {
  TemplatePositionRow,
  BindingRow,
  RepresentativeRow,
  ParticipantRow,
} from '@/server/interfaces/Certificate.interface';

type CertificateMappedItem = {
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  representative: {
    id: string;
    name: string;
    title: string;
  };
};

type CertificateParticipantItem =
  | {
      type: 'qr';
      position: TemplatePositionRow;
      representative: RepresentativeRow;
    }
  | {
      type: 'text';
      position: TemplatePositionRow;
      text: string;
      font_url: string | null;
    };

export const mapCertificateData = ({
  positions,
  bindings,
  representatives,
}: {
  positions: TemplatePositionRow[];
  bindings: BindingRow[];
  representatives: RepresentativeRow[];
}) => {
  // =========================
  // MAP POSITIONS (FAST LOOKUP)
  // =========================
  const positionMap = new Map<string, TemplatePositionRow>();
  for (const p of positions) {
    positionMap.set(p.id, p);
  }

  // =========================
  // MAP REPRESENTATIVES
  // =========================
  const repMap = new Map<string, RepresentativeRow>();
  for (const r of representatives) {
    repMap.set(r.id, r);
  }

  // =========================
  // BUILD RESULT
  // =========================
  const result: CertificateMappedItem[] = [];

  for (const b of bindings) {
    const position = positionMap.get(b.template_position_id);
    const rep = repMap.get(b.batch_representative_id);

    if (!position || !rep) continue;

    result.push({
      position: {
        x: position.x,
        y: position.y,
        width: position.width || 100,
        height: position.height || 100,
        rotation: position.rotation,
      },
      representative: {
        id: rep.representative_id,
        name: rep.name,
        title: rep.title,
      },
    });
  }

  return result;
};

export const mapCertificateDataParticipant = ({
  positions,
  bindings,
  representatives,
  participant,
  fontAssets,
}: {
  positions: TemplatePositionRow[];
  bindings: BindingRow[];
  representatives: RepresentativeRow[];
  participant: ParticipantRow;
  fontAssets: { id: string; file_path: string }[];
}) => {
  // =========================
  // FAST MAP (O(1) lookup)
  // =========================
  const positionMap = new Map<string, TemplatePositionRow>();
  for (const p of positions) {
    positionMap.set(p.id, p);
  }

  const repMap = new Map<string, RepresentativeRow>();
  for (const r of representatives) {
    repMap.set(r.id, r);
  }

  // =========================
  // FONT RESOLUTION (CLEAN)
  // =========================
  const fontPosition = positions.find((p) => p.code === 'font');

  const fontUrl = fontPosition?.asset_id
    ? (fontAssets.find((a) => a.id === fontPosition.asset_id)?.file_path ??
      null)
    : null;

  // =========================
  // RESULT
  // =========================
  const result: CertificateParticipantItem[] = [];

  for (const b of bindings) {
    const position = positionMap.get(b.template_position_id);
    const rep = repMap.get(b.batch_representative_id);

    if (!position || !rep) continue;

    result.push({
      type: 'qr',
      position,
      representative: rep,
    });
  }

  // =========================
  // PARTICIPANT TEXT
  // =========================
  const participantPositions = positions.filter(
    (p) => p.code === 'participant'
  );

  for (const pos of participantPositions) {
    result.push({
      type: 'text',
      position: pos,
      text: participant.name,
      font_url: fontUrl,
    });
  }

  return result;
};
