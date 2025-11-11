#include <iostream>
#include <glm/glm.hpp>
#include <OpenGL/gl3.h> 
#include <OpenGL/glu.h>
#include "grid.hpp"

using namespace std;
using namespace glm;

void draw_grid(const int& size){
    glBegin(GL_LINES);
    glLineWidth(1.0f);
    glColor3f(0.3, 0.3, 0.3);
    for(int i = 1; i< size; i++){
        // 垂直線
        glVertex2f(i, -size);
        glVertex2f(i, size);
        glVertex2f(-i, -size);
        glVertex2f(-i, size);
        // 水平線
        glVertex2f(-size, i);
        glVertex2f(size, i);
        glVertex2f(-size, -i);
        glVertex2f(size, -i);
    }
    glEnd();

    glBegin(GL_LINES);
        glColor3f(1, 0, 0);
        glVertex2f(0, 0);
        glVertex2f(size, 0);
        glColor3f(0.4, 0, 0);
		glVertex2f(0, 0);
		glVertex2f(-size, 0);

        glColor3f(0, 1, 0);
        glVertex2f(0, 0);
        glVertex2f(0, size);
        glColor3f(0, 0.4, 0);
		glVertex2f(0, 0);
		glVertex2f(0, -size);
    glEnd();
}
