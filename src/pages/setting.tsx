import Modal from 'antd/es/modal'
import Tree from 'antd/es/tree'
import { Form, type TreeDataNode, type TreeProps } from 'antd';
import { useCoreStore, type Facility } from '../model';
import { useMemo, useState, type Key } from 'react';

const processSingleFacility = (fac: Facility, parentKey: string, mapd: any) => {
    if (!fac) {
        return {}
    }
    parentKey += fac.id + "-"
    const children: any = fac.positions.map(pos => {
        const val = {
            title: pos.pos,
            key: parentKey + pos.pos,
        }
        mapd[val.key] = pos
        return val
    })
    const cl = fac.childFacilities.map(k => processSingleFacility(k, parentKey, mapd))
    children.push(...cl)
    const ret = {
        title: fac.name,
        key: parentKey,
        children,
    }
    return ret
}

function SettingModal({ open, setModal }) {
    const positionsData = useCoreStore(s => s.positionData)
    const updateSelectedPosition = useCoreStore(s => s.updateSelectedPositions)
    const [treeSelection, setTreeSelection] = useState<Key[]>([])
    const [treeData, mapData] = useMemo(() => {
        const mapData = {}
        return [[processSingleFacility(positionsData, '', mapData)], mapData]
    }, [positionsData])

    const onSubmit = async () => {
        const data = treeSelection.map(k => {
            return mapData[k]
        }).filter(k => k)
        updateSelectedPosition(data)
        setModal(false)
    }
    return <Modal title="Setting" open={open} onCancel={() => setModal(false)} onOk={onSubmit}>
        <Tree
            checkable
            selectable={false}
            onCheck={(ks, _) => setTreeSelection(ks as Key[])}
            treeData={treeData}
        />
    </Modal>

}

export default SettingModal;