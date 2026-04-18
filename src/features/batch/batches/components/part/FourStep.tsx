'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Group,
  Text,
  Rect,
  Transformer,
} from 'react-konva';
import { Button } from '@/components/ui/button';
import {
  IconTrash,
  IconHandStop,
  IconPencil,
  IconArrowLeft,
  IconArrowRight, IconEdit,
} from '@tabler/icons-react';
import { ComboboxField } from '@/components/ui/combobox-field';
import { useGetOneBatch } from '@/hooks/batch';
import { useSession } from 'next-auth/react';
import { useGetAllElementType } from '@/hooks/element-type';
import { useGetAllOrganizationAssets } from '@/hooks/organization-asset';
import { Input } from '@/components/ui/input';
import { createOrganizationAsset } from '@/hooks/organization-asset';

import {
  useGetAllTemplatePositions, createTemplatePositionBulk,
  editTemplatePositionBulk, deleteTemplatePosition
} from '@/hooks/template-position';

type Mode = 'move' | 'edit';

type Element = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export default function Step4SetupTemplate({
  onBack,
  onFinish,
  batchId,
}: any) {
  if (!batchId) {
    return (
      <div className="p-6 text-center">
        Batch tidak ditemukan
        <Button onClick={onBack}>Kembali</Button>
      </div>
    );
  }

  const { batchOne } = useGetOneBatch(batchId);
  const { data: session } = useSession();

  // 🔥 FIX HOOK (NO .data)
  const { elementTypes } = useGetAllElementType();

  // 🔥 FIX FEATURES
  const features = session?.user?.features || {};

  // template positioning
  const { templatePositions, templatePositionsLoading } = useGetAllTemplatePositions(batchId)

  const [elements, setElements] = useState<Element[]>([]);
  const [history, setHistory] = useState<Element[][]>([]);
  const [future, setFuture] = useState<Element[][]>([]);

  const [elementImages, setElementImages] = useState<Record<string, HTMLImageElement>>({});
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('move');
  const { OrganizationAssets } = useGetAllOrganizationAssets(session?.user.organization_id);
  const [stageSize, setStageSize] = useState({
    width: 800,
    height: 600,
  });
  const isEmptyTemplate =
    !templatePositions || templatePositions.length === 0;
  const [initialElements, setInitialElements] = useState<Element[]>([]);
  const [initialAssets, setInitialAssets] = useState({});
  const [isDirty, setIsDirty] = useState(false);


  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({});

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  /* ================= LOAD IMAGE ================= */
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

  useEffect(() => {
    if (!elementTypes) return;

    const images: Record<string, HTMLImageElement> = {};

    const source =
      templatePositions?.length > 0
        ? templatePositions.map((tp: any) => tp.element_type)
        : elementTypes;

    source.forEach((el: any) => {
      if (!el || el.ui_type !== 'element') return;

      const code = el.code.toLowerCase();

      if (images[code]) return;

      const img = new window.Image();
      img.src = el.icon_path;

      images[code] = img;
    });

    setElementImages(images);
  }, [templatePositions, elementTypes]);

  useEffect(() => {
    if (!templatePositions) return;

    // 🔥 JANGAN overwrite kalau user udah edit
    if (isDirty) return;

    const assetMap: Record<string, string> = {};

    templatePositions.forEach((tp: any) => {
      if (tp.asset?.id && tp.element_type_id) {
        assetMap[tp.element_type_id] = tp.asset.id;
      }
    });

    setSelectedAssets(assetMap);
    setInitialAssets(assetMap);
  }, [templatePositions, isDirty]);

  useEffect(() => {
    if (!templatePositions) return;

    // 🔥 prevent overwrite saat user sedang edit
    if (isDirty) return;

    const mapped: Element[] = templatePositions.map((tp: any) => ({
      id: tp.id,
      type: tp.element_type?.code?.toLowerCase(),
      x: tp.x ?? 0,
      y: tp.y ?? 0,
      width: tp.width ?? 120,
      height: tp.height ?? 60,
      rotation: tp.rotation ?? 0,
    }));

    setElements(mapped);
    setInitialElements(mapped);
  }, [templatePositions, isDirty]);

  const normalize = (arr: Element[]) =>
    arr.map((el) => ({
      id: el.id,
      type: el.type,
      x: Math.round(el.x),
      y: Math.round(el.y),
      width: Math.round(el.width),
      height: Math.round(el.height),
      rotation: Math.round(el.rotation ?? 0),
    }));

  useEffect(() => {
    const isSameElements =
      JSON.stringify(normalize(elements)) ===
      JSON.stringify(normalize(initialElements));

    const isSameAssets =
      JSON.stringify(selectedAssets) ===
      JSON.stringify(initialAssets);

    setIsDirty(!(isSameElements && isSameAssets));
  }, [elements, selectedAssets, initialElements, initialAssets]);


  /* ================= HISTORY ================= */
  const pushHistory = (newState: Element[]) => {
    setHistory((prev) => [...prev, elements]);
    setFuture([]);
    setElements(newState);
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;

      const previous = prev[prev.length - 1];

      setFuture((f) => [elements, ...f]);
      setElements(previous);

      return prev.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;

      const next = prev[0];

      setHistory((h) => [...h, elements]);
      setElements(next);

      return prev.slice(1);
    });
  };

  /* ================= FEATURE LOGIC ================= */
  const canUseElement = (el: any) => {
    if (!el.feature_key) return true;

    const value = features[el.feature_key];
    if (!value) return false;

    // boolean
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }

    // limit
    const limit = Number(value);

    const used = elements.filter(
      (e) => e.type === el.code.toLowerCase()
    ).length;

    return used < limit;
  };

  /* ================= ELEMENT ================= */
  const addElement = (el: any) => {
    if (!canUseElement(el)) {
      alert('Limit reached / not allowed');
      return;
    }

    pushHistory([
      ...elements,
      {
        id: Date.now().toString(),
        type: el.code.toLowerCase(),
        x: 120,
        y: 120,
        width: el.default_width || 120,
        height: el.default_height || 60,
      },
    ]);
  };

  const deleteElement = (id: string) => {
    pushHistory(elements.filter((el) => el.id !== id));
    setSelectedId(null);
  };

  const updatePosition = (id: string, x: number, y: number) => {
    pushHistory(
      elements.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };



  /* ================= ZOOM ================= */
  const handleWheel = (e: any) => {
    if (!e.evt.ctrlKey) return;

    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = scale;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const scaleBy = 1.08;
    const direction = e.evt.deltaY > 0 ? -1 : 1;

    const newScale =
      direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const clampedScale = Math.min(4, Math.max(0.2, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setPosition(newPos);
  };

  const handleTransformEnd = (node: any, id: string) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    node.scaleX(1);
    node.scaleY(1);

    pushHistory(
      elements.map((el) =>
        el.id === id
          ? {
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, newWidth),
            height: Math.max(20, newHeight),
            rotation: node.rotation(),
          }
          : el
      )
    );
  };

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      if (!ctrl) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if (e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      if (e.key === '0') {
        e.preventDefault();
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setScale((s) => Math.min(4, s * 1.1));
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale((s) => Math.max(0.2, s / 1.1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [elements, history, future]);

  /* ================= TRANSFORMER ================= */
  useEffect(() => {
    if (!trRef.current || mode !== 'edit') return;

    const stage = stageRef.current;
    const node = stage.findOne(`#${selectedId}`);

    if (node) trRef.current.nodes([node]);
    else trRef.current.nodes([]);
  }, [selectedId, mode]);

  /* ================= SAVE ================= */
  const getFinalData = () => {
    const elementPayload = elements.map((el) => {
      const elType = elementTypes?.find(
        (et: any) =>
          et.code?.toLowerCase() === el.type.toLowerCase()
      );

      if (!elType) return null;

      const isFromDB = templatePositions?.some((tp: any) => tp.id === el.id);

      return {
        ...(isFromDB && { id: el.id }),
        element_type_id: elType.id,

        x: Math.round(el.x),
        y: Math.round(el.y),
        width: Math.round(el.width),
        height: Math.round(el.height),
        rotation: Math.round(el.rotation ?? 0),

        asset_id: null,
        font_size: null,
        font_weight: null,
      };
    }).filter(Boolean);

    // 🔥 ASSET (font/logo)
    const assetPayload = Object.entries(selectedAssets)
      .filter(([_, assetId]) =>
        assetId &&
        assetId !== 'upload' &&
        assetId !== 'none' // 🔥 INI YANG KURANG
      )
      .map(([elementTypeId, assetId]) => ({
        element_type_id: elementTypeId,

        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,

        asset_id: assetId,
        font_size: null,
        font_weight: null,
      }));

    const final = [...elementPayload, ...assetPayload];

    console.log('FINAL PAYLOAD:', final);

    return final;
  };

  const getAssetsByType = (assetType: string) => {
    if (!OrganizationAssets) return [];

    return OrganizationAssets.filter((asset: any) =>
      asset.type?.toLowerCase() === assetType?.toLowerCase()
    );
  };
  if (templatePositionsLoading) {
    return <div className="p-6">Loading template...</div>;
  }
  return (
    <div className="flex flex-col gap-4 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <div className="flex gap-2">
          <Button onClick={() => setMode('move')}>
            <IconHandStop size={16} />
          </Button>

          <Button onClick={() => setMode('edit')}>
            <IconPencil size={16} />
          </Button>

          {selectedId && (
            <Button onClick={() => deleteElement(selectedId)}>
              <IconTrash size={16} />
            </Button>
          )}

          <Button onClick={undo}><IconArrowLeft size={16} /></Button>
          <Button onClick={redo}><IconArrowRight size={16} /></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (!isDirty) {
                onFinish(null); // NEXT
              } else {
                onFinish(getFinalData()); // SAVE
              }
            }}
          >
            {!isDirty ? 'Next' : 'Save'}
          </Button>
        </div>
      </div>

      {/* 🔥 DYNAMIC BUTTON */}
      <div className="flex gap-2 items-center flex-wrap">
        {elementTypes?.map((el: any) => {
          const allowed = canUseElement(el);
          const uiType = el.ui_type?.toLowerCase();

          // ================= ELEMENT (BUTTON) =================
          if (uiType === 'element') {
            return (
              <Button
                key={el.id}
                disabled={!allowed}
                onClick={() => addElement(el)}
                title={el.name}
              >
                <img src={el.icon_path} className="w-4 h-4" />
              </Button>
            );
          }

          // ================= ASSET (INPUT FILE) =================
          if (uiType === 'asset') {
            const assets = getAssetsByType(el.asset_type);

            // 🔥 inject upload option di paling bawah
            const itemsWithUpload = [
              { id: 'none', name: 'Tidak ada' }, // 🔥 tambahan
              ...assets,
              { id: 'upload', name: '+ Upload New', file_path: 'upload' },
            ];

            return (
              <div key={el.id} className="flex items-center gap-2">
                <ComboboxField
                  value={selectedAssets[el.id] ?? ''}
                  items={itemsWithUpload}
                  getValue={(item: any) =>
                    item.file_path === 'upload' ? 'upload' : item.id
                  }
                  getLabel={(item: any) => item.name}
                  placeholder={`Pilih ${el.name}`}
                  onChange={(value) => {
                    // 🔥 HANDLE UPLOAD
                    if (value === 'upload') {
                      document.getElementById(`upload-${el.id}`)?.click();
                      return;
                    }

                    // 🔥 HANDLE "TIDAK ADA" → HAPUS DARI STATE
                    if (value === 'none') {
                      setSelectedAssets((prev) => {
                        const updated = { ...prev };
                        delete updated[el.id]; // 🔥 INI DIA TARONYA
                        return updated;
                      });
                      return;
                    }

                    // 🔥 HANDLE SELECT ASSET NORMAL
                    setSelectedAssets((prev) => ({
                      ...prev,
                      [el.id]: value,
                    }));

                    console.log('SELECTED ASSET:', value);
                  }}
                />

                {/* 🔥 hidden input */}
                <Input
                  id={`upload-${el.id}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    console.log('UPLOAD FILE:', file);

                    // 👉 sambung ke API upload
                  }}
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* CANVAS */}
      <div className="border bg-gray-100 overflow-auto max-h-[80vh] rounded-lg">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onWheel={handleWheel}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={image.width}
                height={image.height}
              />
            )}

            {elements.map((el) => (
              <Group
                key={el.id}
                id={el.id}
                x={el.x}
                y={el.y}
                width={el.width}      // 🔥 WAJIB
                height={el.height}    // 🔥 WAJIB
                draggable={mode === 'move'}
                onClick={() => setSelectedId(el.id)}
                onDragEnd={(e) =>
                  updatePosition(el.id, e.target.x(), e.target.y())
                }
                onTransformEnd={(e) =>
                  handleTransformEnd(e.target, el.id) // 🔥 PINDAH SINI
                }
              >
                {/* 🔥 IMAGE ELEMENT */}
                {elementImages[el.type] && (
                  <KonvaImage
                    image={elementImages[el.type]}
                    width={el.width}
                    height={el.height}
                  />
                )}

                {/* 🔥 BORDER (biar tetep bisa select) */}
                <Rect
                  width={el.width}
                  height={el.height}
                  fill="transparent"
                  stroke={selectedId === el.id ? '#FF7F11' : 'black'}
                />
              </Group>
            ))}

            {mode === 'edit' && (
              <Transformer ref={trRef} rotateEnabled
                keepRatio={false}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) {
                    return oldBox;
                  }
                  return newBox;
                }} />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}