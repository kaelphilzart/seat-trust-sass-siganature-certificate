
export const mapCertificateData = ({
    positions,
    bindings,
    representatives,
}: {
    positions: any[];
    bindings: any[];
    representatives: any[];
}) => {

    // =========================
    // MAP POSITIONS (FAST LOOKUP)
    // =========================
    const positionMap = new Map<string, any>();
    for (const p of positions) {
        positionMap.set(p.id, p);
    }

    // =========================
    // MAP REPRESENTATIVES
    // =========================
    const repMap = new Map<string, any>();
    for (const r of representatives) {
        repMap.set(r.id, r);
    }

    // =========================
    // BUILD RESULT
    // =========================
    const result: any[] = [];

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
    positions: any[];
    bindings: any[];
    representatives: any[];
    participant: any;
    fontAssets: any[];
}) => {

    // =========================
    // FAST MAP (O(1) lookup)
    // =========================
    const positionMap = new Map<string, any>();
    for (const p of positions) {
        positionMap.set(p.id, p);
    }

    const repMap = new Map<string, any>();
    for (const r of representatives) {
        repMap.set(r.id, r);
    }

    // =========================
    // FONT RESOLUTION (CLEAN)
    // =========================
    const fontPosition = positions.find((p) => p.code === 'font');

    let fontUrl: string | null = null;

    if (fontPosition?.asset_id) {
        const asset = fontAssets.find((a) => a.id === fontPosition.asset_id);
        fontUrl = asset?.file_path || null;
    }

    if (fontUrl) {
        console.log('🎨 FONT OK:', fontUrl);
    }

    // =========================
    // RESULT
    // =========================
    const result: any[] = [];

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