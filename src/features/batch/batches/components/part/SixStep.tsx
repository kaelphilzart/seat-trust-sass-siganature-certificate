'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Group,
  Rect,
  Text,
} from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconZoomIn, IconZoomOut } from '@tabler/icons-react';

import { useGetAllBatchRepresentatives } from '@/hooks/batch-representative';
import { useGetAllTemplatePositions } from '@/hooks/template-position';
import { useGetAllTemplatePositionBindings } from '@/hooks/template-position-bindings';
import { useGetOneBatch } from '@/hooks/batch';
import { ITemplatePosition } from '@/types/template-position';
import { ITemplatePositionBinding } from '@/types/template-position-binding';

type Rep = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  onFinish: (payload: {
    data: {
      batch_id: string;
      template_position_id: string;
      batch_representative_id: string;
    }[];
    isDirty: boolean;
  }) => void;
  onBack: () => void;
  batchId: string;
};

const COLORS = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#E0F7FA'];

export default function SixStep({ onFinish, onBack, batchId }: Props) {
  const { batchRepresentatives } = useGetAllBatchRepresentatives(batchId);
  const { templatePositions } = useGetAllTemplatePositions(batchId);
  const { templatePositionBindings } =
    useGetAllTemplatePositionBindings(batchId);
  const { batchOne } = useGetOneBatch(batchId);

  const [activeRepId, setActiveRepId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  const stageRef = useRef<KonvaStage | null>(null);
  const isInitialized = useRef(false);

  // =========================
  // ASSIGNABLE CHECK
  // =========================
  const isAssignable = (code?: string) =>
    !!code && !code.toLowerCase().includes('participant');

  // =========================
  // LOAD TEMPLATE IMAGE
  // =========================
  useEffect(() => {
    if (!batchOne?.template?.file_path) return;

    const img = new window.Image();
    img.src = batchOne.template.file_path;

    img.onload = () => {
      setImage(img);
      setStageSize({
        width: img.width,
        height: img.height,
      });
    };
  }, [batchOne?.template?.file_path]);

  // =========================
  // REPRESENTATIVES
  // =========================
  const reps = useMemo<Rep[]>(() => {
    return (
      batchRepresentatives?.map((item, i) => ({
        id: item.id,
        name: item.representative?.name ?? '',
        color: COLORS[i % COLORS.length],
      })) || []
    );
  }, [batchRepresentatives]);

  const repMap = useMemo(() => {
    const map: Record<string, Rep> = {};
    reps.forEach((r) => (map[r.id] = r));
    return map;
  }, [reps]);

  // =========================
  // ELEMENTS
  // =========================
  const elements = useMemo<ITemplatePosition[]>(() => {
    return (
      templatePositions?.filter(
        (tp) => tp.element_type?.ui_type === 'element'
      ) || []
    );
  }, [templatePositions]);

  // =========================
  // INIT BINDINGS (ONLY ONCE)
  // =========================
  useEffect(() => {
    if (!templatePositionBindings?.length) return;
    if (isInitialized.current) return;

    const initial: Record<string, string> = {};

    templatePositionBindings.forEach((b: ITemplatePositionBinding) => {
      const tpId = b.templatePosition?.id;
      const repId = b.batchRepresentative?.id;

      if (tpId && repId) {
        initial[tpId] = repId;
      }
    });

    setAssignments(initial);
    isInitialized.current = true;
  }, [templatePositionBindings]);

  //==========================
  // =========================
  // DB INITIAL STATE (BASELINE)
  // =========================
  const dbAssignments = useMemo(() => {
    const map: Record<string, string> = {};

    templatePositionBindings?.forEach((b: ITemplatePositionBinding) => {
      const tpId = b.templatePosition?.id;
      const repId = b.batchRepresentative?.id;

      if (tpId && repId) {
        map[tpId] = repId;
      }
    });

    return map;
  }, [templatePositionBindings]);

  // =========================
  // CURRENT PAYLOAD
  // =========================
  const payload = useMemo(() => {
    return Object.entries(assignments)
      .filter(([, repId]) => repId)
      .map(([elementId, repId]) => ({
        batch_id: batchId,
        template_position_id: elementId,
        batch_representative_id: repId,
      }));
  }, [assignments, batchId]);

  // =========================
  // DIRTY CHECK
  // =========================
  const isDirty = useMemo(() => {
    const dbKeys = Object.keys(dbAssignments);
    const curKeys = Object.keys(assignments);

    if (dbKeys.length !== curKeys.length) return true;

    return dbKeys.some((key) => dbAssignments[key] !== assignments[key]);
  }, [dbAssignments, assignments]);

  // =========================
  // SUBMIT (NO DIRECT SAVE ANYMORE)
  // =========================
  const handleNext = () => {
    onFinish({
      data: payload,
      isDirty,
    });
  };
  // =========================
  // ICONS
  // =========================
  const icons = useMemo(() => {
    if (!elements?.length) return {};

    const imgs: Record<string, HTMLImageElement> = {};

    elements.forEach((el: ITemplatePosition) => {
      const code = el.element_type?.code?.toLowerCase();
      if (!code || imgs[code]) return;

      const img = new window.Image();
      img.src = el.element_type?.icon_path ?? '';

      imgs[code] = img;
    });

    return imgs;
  }, [elements]);

  // =========================
  // ZOOM
  // =========================
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey) return;

    e.evt.preventDefault();

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? scale / scaleBy : scale * scaleBy;

    setScale(Math.min(4, Math.max(0.5, newScale)));
  };

  // =========================
  // ASSIGN LOGIC (SAFE TOGGLE)
  // =========================
  const handleAssign = (elementId: string, assignable: boolean) => {
    if (!activeRepId || !assignable) return;

    setAssignments((prev) => {
      const current = prev[elementId];

      const next = { ...prev };

      if (current === activeRepId) {
        delete next[elementId];
      } else {
        next[elementId] = activeRepId;
      }

      return next;
    });
  };

  // =========================
  // VALIDATION
  // =========================
  const isAllAssigned = elements
    .filter((el: ITemplatePosition) => isAssignable(el.element_type?.code))
    .every((el: ITemplatePosition) => assignments[el.id]);

  // =========================
  // SAVE PAYLOAD
  // =========================
  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft size={16} />
          Kembali
        </Button>

        <div className="flex gap-2">
          <Button onClick={() => setScale((s) => Math.min(4, s * 1.2))}>
            <IconZoomIn size={16} />
          </Button>

          <Button onClick={() => setScale((s) => Math.max(0.5, s / 1.2))}>
            <IconZoomOut size={16} />
          </Button>

          <Button onClick={handleNext} disabled={!isAllAssigned}>
            {isDirty ? 'Save' : 'Next'}
          </Button>
        </div>
      </div>

      {/* REPRESENTATIVES */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reps.map((rep) => (
          <div
            key={rep.id}
            onClick={() => setActiveRepId(rep.id)}
            className="px-4 py-2 rounded border cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeRepId === rep.id ? rep.color : '#fff',
            }}
          >
            {rep.name}
          </div>
        ))}
      </div>

      {/* CANVAS */}
      <div className="border rounded overflow-auto bg-gray-100">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          draggable
          onWheel={handleWheel}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={stageSize.width}
                height={stageSize.height}
              />
            )}

            {elements.map((el: ITemplatePosition) => {
              const code = el.element_type?.code?.toLowerCase();
              const assignable = isAssignable(code);

              const repId = assignments[el.id];
              const rep = repMap[repId];

              return (
                <Group
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  onClick={() => handleAssign(el.id, assignable)}
                >
                  {code && icons[code] && (
                    <KonvaImage
                      image={icons[code.toLowerCase()]}
                      width={el.width || 80}
                      height={el.height || 40}
                    />
                  )}

                  <Rect
                    width={el.width || 80}
                    height={el.height || 40}
                    stroke={rep ? 'black' : '#aaa'}
                    fill={rep ? rep.color : 'transparent'}
                    opacity={assignable ? 0.5 : 0.2}
                  />

                  <Text
                    text={!assignable ? 'Auto' : rep ? rep.name : ''}
                    fontSize={11}
                    fill={assignable ? 'black' : '#999'}
                    y={(el.height || 40) + 2}
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {!activeRepId && (
        <div className="text-xs text-gray-400">
          Pilih representative dulu, lalu klik element
        </div>
      )}
    </div>
  );
}
