import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// a little function to help us with reordering the result
const reOrder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


export default function OrderlyListHr({list, updateHandler, onItem, itemKey, onListStyle, onItemStyle, onListClass, onItemClass}) {

    const onDragEnd = (result) => {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
    
        const update = reOrder(
            list,
            result.source.index,
            result.destination.index
        )
        updateHandler(update)
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable direction="horizontal" droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={onListClass? onListClass(snapshot.isDraggingOver, list.length) : null}
                style={onListStyle? onListStyle(snapshot.isDraggingOver, list.length) : null}
              >
                {list.map((item, index) => (
                  <Draggable key={item[itemKey]} draggableId={item[itemKey]} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={onItemClass? onItemClass(
                          snapshot.isDragging,
                          provided.draggableProps.className,
                          item
                        ) : null}
                        style={onItemStyle? onItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style,
                          item
                        ) : null}
                      >
                        {
                          onItem?
                          onItem(item, index, snapshot.isDragging) : item
                        }
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
    )
}