import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// a little function to help us with reordering the result
const reOrder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


export default function OrderlyListVr({list, updateHandler, onItem, onListStyle, onItemStyle}) {

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
          <Droppable direction="vertical" droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={onListStyle? onListStyle(snapshot.isDraggingOver) : null}
              >
                {list.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={onItemStyle? onItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        ) : null}
                      >
                        {
                          onItem?
                          onItem(item.content) : item.content
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